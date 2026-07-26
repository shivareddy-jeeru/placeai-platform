import { useSession } from '../context/SessionContext';

export default function usePlacementProfile() {
  const {
    placementProfile,
    updateProfile,
    dispatchEvent,
    completeTask,
    startNewAnalysis,
    resetSession,
    showToast
  } = useSession();

  return {
    placementProfile,
    updateProfile,
    dispatchEvent,
    completeTask,
    startNewAnalysis,
    resetSession,
    showToast
  };
}
