import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BeneficiaryModal from '../BeneficiaryModal';
import { useVereavementContract } from '../../hooks/useVereavementContract';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';

jest.mock('../../hooks/useVereavementContract');
jest.mock('../../contexts/NotificationContext');
jest.mock('../../contexts/LoadingContext');

describe('BeneficiaryModal', () => {
  const mockAddBeneficiary = jest.fn();
  const mockGetBeneficiaries = jest.fn();
  const mockRemoveBeneficiary = jest.fn();
  const mockShowNotification = jest.fn();
  const mockSetLoading = jest.fn();
  
  const mockBeneficiaries = [
    { address: '0x123...456', percentage: 30 },
    { address: '0x789...012', percentage: 20 },
  ];

  beforeEach(() => {
    (useVereavementContract as jest.Mock).mockReturnValue({
      addBeneficiary: mockAddBeneficiary,
      getBeneficiaries: mockGetBeneficiaries,
      removeBeneficiary: mockRemoveBeneficiary,
    });
    
    (useNotification as jest.Mock).mockReturnValue({
      showNotification: mockShowNotification,
    });
    
    (useLoading as jest.Mock).mockReturnValue({
      isLoading: {},
      setLoading: mockSetLoading,
    });

    mockGetBeneficiaries.mockResolvedValue(mockBeneficiaries);
    jest.clearAllMocks();
  });

  it('renders correctly and fetches beneficiaries when opened', async () => {
    render(<BeneficiaryModal isOpen={true} onClose={() => {}} />);
    
    expect(screen.getByText('Manage Beneficiaries')).toBeInTheDocument();
    expect(mockGetBeneficiaries).toHaveBeenCalled();
    
    await waitFor(() => {
      expect(screen.getByText('30% Share')).toBeInTheDocument();
      expect(screen.getByText('20% Share')).toBeInTheDocument();
    });
  });

  it('handles adding a new beneficiary successfully', async () => {
    mockAddBeneficiary.mockResolvedValue({
      wait: () => Promise.resolve(),
    });

    render(<BeneficiaryModal isOpen={true} onClose={() => {}} />);
    
    // Click "Add New" button
    fireEvent.click(screen.getByText('Add New'));
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('0x...'), {
      target: { value: '0xnewbeneficiary' },
    });
    fireEvent.change(screen.getByPlaceholderText('1-100'), {
      target: { value: '25' },
    });
    
    // Submit the form
    fireEvent.click(screen.getByText('Add Beneficiary'));
    
    await waitFor(() => {
      expect(mockAddBeneficiary).toHaveBeenCalledWith('0xnewbeneficiary', 25);
      expect(mockShowNotification).toHaveBeenCalledWith('Beneficiary added successfully!', 'success');
      expect(mockGetBeneficiaries).toHaveBeenCalled();
    });
  });

  it('validates percentage total when adding beneficiary', async () => {
    render(<BeneficiaryModal isOpen={true} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Allocation: 50%')).toBeInTheDocument();
    });

    // Try to add beneficiary with percentage that would exceed 100%
    fireEvent.click(screen.getByText('Add New'));
    fireEvent.change(screen.getByPlaceholderText('0x...'), {
      target: { value: '0xnewbeneficiary' },
    });
    fireEvent.change(screen.getByPlaceholderText('1-100'), {
      target: { value: '60' },
    });
    
    fireEvent.click(screen.getByText('Add Beneficiary'));
    
    expect(mockShowNotification).toHaveBeenCalledWith('Total percentage cannot exceed 100%', 'warning');
    expect(mockAddBeneficiary).not.toHaveBeenCalled();
  });

  it('handles removing a beneficiary', async () => {
    mockRemoveBeneficiary.mockResolvedValue({
      wait: () => Promise.resolve(),
    });

    render(<BeneficiaryModal isOpen={true} onClose={() => {}} />);
    
    await waitFor(() => {
      const removeButtons = screen.getAllByRole('button');
      const removeButton = removeButtons.find(button => 
        button.className.includes('text-red-400')
      );
      if (removeButton) {
        fireEvent.click(removeButton);
      }
    });
    
    await waitFor(() => {
      expect(mockRemoveBeneficiary).toHaveBeenCalledWith(mockBeneficiaries[0].address);
      expect(mockShowNotification).toHaveBeenCalledWith('Beneficiary removed successfully!', 'success');
      expect(mockGetBeneficiaries).toHaveBeenCalled();
    });
  });

  it('handles errors when fetching beneficiaries', async () => {
    mockGetBeneficiaries.mockRejectedValue(new Error('Failed to fetch'));
    
    render(<BeneficiaryModal isOpen={true} onClose={() => {}} />);
    
    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith('Failed to fetch beneficiaries', 'error');
    });
  });

  it('validates input fields', async () => {
    render(<BeneficiaryModal isOpen={true} onClose={() => {}} />);
    
    fireEvent.click(screen.getByText('Add New'));
    fireEvent.click(screen.getByText('Add Beneficiary'));
    
    expect(mockShowNotification).toHaveBeenCalledWith('Please fill in all fields', 'warning');
    
    fireEvent.change(screen.getByPlaceholderText('0x...'), {
      target: { value: '0xaddress' },
    });
    fireEvent.change(screen.getByPlaceholderText('1-100'), {
      target: { value: '101' },
    });
    
    fireEvent.click(screen.getByText('Add Beneficiary'));
    
    expect(mockShowNotification).toHaveBeenCalledWith('Percentage must be between 1 and 100', 'warning');
  });
}); 