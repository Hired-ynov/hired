import { toast } from 'react-toastify';

import { AuthType } from './types';

export function handleAuthError(error: unknown, type: AuthType) {
  const lowered = String(error).toLowerCase();

  if (type === AuthType.LOGIN) {
    const invalidCreds =
      /invalid|incorrect|wrong|password|email|identifiant|password|not|strong|enough/i;
    if (invalidCreds.test(lowered)) {
      toast.error('Identifiants incorrects');
      return;
    }
  }

  if (type === AuthType.REGISTER) {
    const emailTaken = /existe|taken|already|email|utilisé/i;
    if (emailTaken.test(lowered)) {
      toast.error('Cette adresse email est déjà utilisée');
      return;
    }
  }

  const defaultMessage =
    type === AuthType.LOGIN
      ? 'La connexion a échoué'
      : "L'inscription a échoué";

  toast.error(defaultMessage);
}
