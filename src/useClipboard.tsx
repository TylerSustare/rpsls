import { useState, useEffect } from 'react';
import copy from 'copy-to-clipboard';

interface Options {
  /**
   * Reset the status after a certain number of milliseconds. This is useful
   * for showing a temporary success message.
   */
  successDuration?: number;
}

interface Result {
  isCopied: boolean;
  copy: (text: string) => void;
}

export function useClipboard(options?: Options): Result {
  const [isCopied, setIsCopied] = useState(false);
  const successDuration = options && options.successDuration;

  useEffect(() => {
    if (isCopied && successDuration) {
      const id = setTimeout(() => {
        setIsCopied(false);
      }, successDuration);

      return () => {
        clearTimeout(id);
      };
    }
  }, [isCopied, successDuration]);

  return {
    isCopied,
    copy: (text: string) => {
      const didCopy = copy(text);
      setIsCopied(didCopy);
    },
  };
}
