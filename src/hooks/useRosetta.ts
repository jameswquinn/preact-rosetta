import { useContext } from 'preact/hooks';
import { RosettaContext, RosettaContextType } from '../RosettaProvider';

export function useRosetta(): RosettaContextType {
  const context = useContext(RosettaContext);
  if (!context) {
    throw new Error('useRosetta must be used within a RosettaProvider');
  }
  return context;
}
