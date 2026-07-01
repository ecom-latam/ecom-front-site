import { IllustrationMessage } from 'zoui';
import { ILLUSTRATION_MESSAGES } from '@/lib/illustrationMessages';

export function PageUnderConstruction() {
  return <IllustrationMessage {...ILLUSTRATION_MESSAGES['under-construction']} />;
}
