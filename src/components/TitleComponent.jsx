import { useEffect } from 'react';

function TitleComponent({ title }) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    // Limpa o título quando o componente é desmontado
    return () => {
      document.title = previousTitle;
    };
  }, [title]);

  return null;
}

export default TitleComponent; 