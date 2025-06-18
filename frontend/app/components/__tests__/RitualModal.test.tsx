import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RitualModal from '../RitualModal';
import { useVereavementContract } from '../../hooks/useVereavementContract';
import { useNotification } from '../../contexts/NotificationContext';
import { useLoading } from '../../contexts/LoadingContext';

// Mock the hooks
jest.mock('../../hooks/useVereavementContract');
jest.mock('../../contexts/NotificationContext');
jest.mock('../../contexts/LoadingContext');

describe('RitualModal', () => {
  const mockCompleteRitual = jest.fn();
  const mockGetRitualValue = jest.fn();
  const mockShowNotification = jest.fn();
  const mockSetLoading = jest.fn();
  
  beforeEach(() => {
    // Setup mock implementations
    (useVereavementContract as jest.Mock).mockReturnValue({
      completeRitual: mockCompleteRitual,
      getRitualValue: mockGetRitualValue,
    });
    
    (useNotification as jest.Mock).mockReturnValue({
      showNotification: mockShowNotification,
    });
    
    (useLoading as jest.Mock).mockReturnValue({
      isLoading: {},
      setLoading: mockSetLoading,
    });

    mockGetRitualValue.mockResolvedValue('100');
    jest.clearAllMocks();
  });

  it('renders all ritual types correctly', () => {
    render(<RitualModal isOpen={true} onClose={() => {}} />);
    
    expect(screen.getByText('Complete Ritual')).toBeInTheDocument();
    expect(screen.getByText('Meditation Ritual')).toBeInTheDocument();
    expect(screen.getByText('Tree Planting')).toBeInTheDocument();
    expect(screen.getByText('Story Sharing')).toBeInTheDocument();
    expect(screen.getByText('Charitable Giving')).toBeInTheDocument();
  });

  it('shows ritual descriptions on hover', async () => {
    render(<RitualModal isOpen={true} onClose={() => {}} />);
    
    const meditationCard = screen.getByText('Meditation Ritual').closest('div');
    if (!meditationCard) throw new Error('Meditation card not found');
    
    fireEvent.mouseEnter(meditationCard);
    
    expect(screen.getByText(/A mindful practice to honor/)).toBeInTheDocument();
    expect(screen.getByText(/Increases ritual value by 10 points/)).toBeInTheDocument();
  });

  it('completes meditation ritual successfully', async () => {
    mockCompleteRitual.mockResolvedValue({
      wait: () => Promise.resolve(),
    });

    render(<RitualModal isOpen={true} onClose={() => {}} />);
    
    // Select meditation ritual
    const meditationCard = screen.getByText('Meditation Ritual').closest('div');
    if (!meditationCard) throw new Error('Meditation card not found');
    fireEvent.click(meditationCard);
    
    // Complete ritual
    fireEvent.click(screen.getByText('Complete Ritual'));
    
    await waitFor(() => {
      expect(mockCompleteRitual).toHaveBeenCalledWith('meditation');
      expect(mockShowNotification).toHaveBeenCalledWith('Ritual completed successfully!', 'success');
    });
  });

  it('completes tree planting ritual successfully', async () => {
    mockCompleteRitual.mockResolvedValue({
      wait: () => Promise.resolve(),
    });

    render(<RitualModal isOpen={true} onClose={() => {}} />);
    
    // Select tree planting ritual
    const treePlantingCard = screen.getByText('Tree Planting').closest('div');
    if (!treePlantingCard) throw new Error('Tree planting card not found');
    fireEvent.click(treePlantingCard);
    
    // Complete ritual
    fireEvent.click(screen.getByText('Complete Ritual'));
    
    await waitFor(() => {
      expect(mockCompleteRitual).toHaveBeenCalledWith('treePlanting');
      expect(mockShowNotification).toHaveBeenCalledWith('Ritual completed successfully!', 'success');
    });
  });

  it('handles ritual completion failure', async () => {
    mockCompleteRitual.mockRejectedValue(new Error('Transaction failed'));

    render(<RitualModal isOpen={true} onClose={() => {}} />);
    
    // Select meditation ritual
    const meditationCard = screen.getByText('Meditation Ritual').closest('div');
    if (!meditationCard) throw new Error('Meditation card not found');
    fireEvent.click(meditationCard);
    
    // Try to complete ritual
    fireEvent.click(screen.getByText('Complete Ritual'));
    
    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith('Failed to complete ritual', 'error');
    });
  });

  it('validates ritual type selection', async () => {
    render(<RitualModal isOpen={true} onClose={() => {}} />);
    
    // Try to complete without selecting a ritual
    fireEvent.click(screen.getByText('Complete Ritual'));
    
    expect(mockShowNotification).toHaveBeenCalledWith('Please select a ritual type', 'warning');
    expect(mockCompleteRitual).not.toHaveBeenCalled();
  });

  it('updates ritual value after completion', async () => {
    mockCompleteRitual.mockResolvedValue({
      wait: () => Promise.resolve(),
    });

    render(<RitualModal isOpen={true} onClose={() => {}} />);
    
    // Select and complete meditation ritual
    const meditationCard = screen.getByText('Meditation Ritual').closest('div');
    if (!meditationCard) throw new Error('Meditation card not found');
    fireEvent.click(meditationCard);
    fireEvent.click(screen.getByText('Complete Ritual'));
    
    await waitFor(() => {
      expect(mockGetRitualValue).toHaveBeenCalled();
    });
  });

  it('closes modal on successful completion', async () => {
    const onClose = jest.fn();
    mockCompleteRitual.mockResolvedValue({
      wait: () => Promise.resolve(),
    });

    render(<RitualModal isOpen={true} onClose={onClose} />);
    
    // Select and complete meditation ritual
    const meditationCard = screen.getByText('Meditation Ritual').closest('div');
    if (!meditationCard) throw new Error('Meditation card not found');
    fireEvent.click(meditationCard);
    fireEvent.click(screen.getByText('Complete Ritual'));
    
    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
}); 