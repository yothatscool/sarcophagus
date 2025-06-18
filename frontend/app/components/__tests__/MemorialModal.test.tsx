import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MemorialModal from '../MemorialModal';
import { useVereavementContract } from '../../hooks/useVereavementContract';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useIPFS } from '../../hooks/useIPFS';

jest.mock('../../hooks/useVereavementContract');
jest.mock('../../contexts/NotificationContext');
jest.mock('../../contexts/LoadingContext');
jest.mock('../../hooks/useIPFS');

describe('MemorialModal', () => {
  const mockPreserveMemorial = jest.fn();
  const mockUploadToIPFS = jest.fn();
  const mockShowNotification = jest.fn();
  const mockSetLoading = jest.fn();

  beforeEach(() => {
    (useVereavementContract as jest.Mock).mockReturnValue({
      preserveMemorial: mockPreserveMemorial,
    });
    
    (useIPFS as jest.Mock).mockReturnValue({
      uploadToIPFS: mockUploadToIPFS,
    });
    
    (useNotification as jest.Mock).mockReturnValue({
      showNotification: mockShowNotification,
    });
    
    (useLoading as jest.Mock).mockReturnValue({
      isLoading: {},
      setLoading: mockSetLoading,
    });

    jest.clearAllMocks();
  });

  it('renders memorial form correctly', () => {
    render(<MemorialModal isOpen={true} onClose={() => {}} />);
    
    expect(screen.getByText('Preserve Memorial')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your memorial message...')).toBeInTheDocument();
    expect(screen.getByText('Upload Media')).toBeInTheDocument();
  });

  it('handles text memorial preservation successfully', async () => {
    const memorialHash = 'QmTestHash123';
    mockUploadToIPFS.mockResolvedValue(memorialHash);
    mockPreserveMemorial.mockResolvedValue({
      wait: () => Promise.resolve(),
    });

    render(<MemorialModal isOpen={true} onClose={() => {}} />);
    
    // Enter memorial text
    fireEvent.change(screen.getByPlaceholderText('Enter your memorial message...'), {
      target: { value: 'Test memorial message' },
    });
    
    // Submit memorial
    fireEvent.click(screen.getByText('Preserve Memorial'));
    
    await waitFor(() => {
      expect(mockUploadToIPFS).toHaveBeenCalledWith('Test memorial message');
      expect(mockPreserveMemorial).toHaveBeenCalledWith(memorialHash);
      expect(mockShowNotification).toHaveBeenCalledWith('Memorial preserved successfully!', 'success');
    });
  });

  it('handles image upload successfully', async () => {
    const memorialHash = 'QmImageHash123';
    mockUploadToIPFS.mockResolvedValue(memorialHash);
    mockPreserveMemorial.mockResolvedValue({
      wait: () => Promise.resolve(),
    });

    const file = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });
    render(<MemorialModal isOpen={true} onClose={() => {}} />);
    
    // Upload image
    const input = screen.getByLabelText('Upload Media');
    fireEvent.change(input, { target: { files: [file] } });
    
    // Submit memorial
    fireEvent.click(screen.getByText('Preserve Memorial'));
    
    await waitFor(() => {
      expect(mockUploadToIPFS).toHaveBeenCalledWith(file);
      expect(mockPreserveMemorial).toHaveBeenCalledWith(memorialHash);
      expect(mockShowNotification).toHaveBeenCalledWith('Memorial preserved successfully!', 'success');
    });
  });

  it('validates file size', async () => {
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    render(<MemorialModal isOpen={true} onClose={() => {}} />);
    
    // Try to upload large file
    const input = screen.getByLabelText('Upload Media');
    fireEvent.change(input, { target: { files: [largeFile] } });
    
    expect(mockShowNotification).toHaveBeenCalledWith('File size must be less than 10MB', 'warning');
    expect(mockUploadToIPFS).not.toHaveBeenCalled();
  });

  it('validates file type', async () => {
    const invalidFile = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
    render(<MemorialModal isOpen={true} onClose={() => {}} />);
    
    // Try to upload invalid file
    const input = screen.getByLabelText('Upload Media');
    fireEvent.change(input, { target: { files: [invalidFile] } });
    
    expect(mockShowNotification).toHaveBeenCalledWith('Invalid file type', 'warning');
    expect(mockUploadToIPFS).not.toHaveBeenCalled();
  });

  it('handles IPFS upload failure', async () => {
    mockUploadToIPFS.mockRejectedValue(new Error('IPFS upload failed'));

    render(<MemorialModal isOpen={true} onClose={() => {}} />);
    
    // Enter memorial text
    fireEvent.change(screen.getByPlaceholderText('Enter your memorial message...'), {
      target: { value: 'Test memorial message' },
    });
    
    // Submit memorial
    fireEvent.click(screen.getByText('Preserve Memorial'));
    
    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith('Failed to upload to IPFS', 'error');
      expect(mockPreserveMemorial).not.toHaveBeenCalled();
    });
  });

  it('handles contract interaction failure', async () => {
    const memorialHash = 'QmTestHash123';
    mockUploadToIPFS.mockResolvedValue(memorialHash);
    mockPreserveMemorial.mockRejectedValue(new Error('Transaction failed'));

    render(<MemorialModal isOpen={true} onClose={() => {}} />);
    
    // Enter memorial text
    fireEvent.change(screen.getByPlaceholderText('Enter your memorial message...'), {
      target: { value: 'Test memorial message' },
    });
    
    // Submit memorial
    fireEvent.click(screen.getByText('Preserve Memorial'));
    
    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith('Failed to preserve memorial', 'error');
    });
  });

  it('validates empty submission', () => {
    render(<MemorialModal isOpen={true} onClose={() => {}} />);
    
    // Try to submit without content
    fireEvent.click(screen.getByText('Preserve Memorial'));
    
    expect(mockShowNotification).toHaveBeenCalledWith('Please add memorial content', 'warning');
    expect(mockUploadToIPFS).not.toHaveBeenCalled();
  });

  it('closes modal on successful preservation', async () => {
    const onClose = jest.fn();
    const memorialHash = 'QmTestHash123';
    mockUploadToIPFS.mockResolvedValue(memorialHash);
    mockPreserveMemorial.mockResolvedValue({
      wait: () => Promise.resolve(),
    });

    render(<MemorialModal isOpen={true} onClose={onClose} />);
    
    // Enter memorial text
    fireEvent.change(screen.getByPlaceholderText('Enter your memorial message...'), {
      target: { value: 'Test memorial message' },
    });
    
    // Submit memorial
    fireEvent.click(screen.getByText('Preserve Memorial'));
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
}); 