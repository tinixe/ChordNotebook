import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { TabType } from './Navigation';

interface HelpContent {
  title: string;
  introduction: string;
  steps: string[];
  tip: string;
}

interface HelpDialogProps {
  activeTab: TabType;
  isOpen: boolean;
  onClose: () => void;
}

const HELP_CONTENT: Record<TabType, HelpContent> = {
  builder: {
    title: 'Constructor de acordes',
    introduction: 'Crea una figura en el diapasón y escucha cómo suena.',
    steps: [
      'Selecciona los trastes de las cuerdas para poner una nota; pulsa de nuevo para quitarla.',
      'Usa el control de ajustes para cambiar las preferencias de notación y sonido.',
      'Reproduce el acorde y guárdalo para encontrarlo después en tu biblioteca.',
    ],
    tip: 'Puedes editar el nombre del acorde y crear nombres personalizados. Además, los acordes sin cuerdas al aire se trasponen automáticamente.',
  },
  trainer: {
    title: 'Entrenador',
    introduction: 'Practica acordes con ejercicios y secuencias adaptadas a tus filtros.',
    steps: [
      'Abre los filtros para escoger la tónica, extensiones, tipos de acorde y grupos de cuerdas.',
      'Elige el modo de selección del siguiente acorde y el tempo desde ajustes.',
      'Inicia la práctica para escuchar y recorrer los acordes propuestos.',
    ],
    tip: 'Guarda acordes en la biblioteca para ampliar el material disponible para practicar.',
  },
  finder: {
    title: 'Buscador de acordes',
    introduction: 'Encuentra acordes guardados a partir de posiciones en el diapasón.',
    steps: [
      'Pulsa los trastes correspondientes para describir la digitación.',
      'Consulta los resultados agrupados por la función de su nota más aguda.',
      'Los colores corresponden al tipo de acorde base (sin contar extensiones).'
    ],
    tip: 'Deja sin seleccionar las cuerdas que no quieras usar como criterio.',
  },
  'harmonic-path': {
    title: 'Recorrido armónico',
    introduction: 'Explora progresiones y escucha cómo se enlazan sus acordes.',
    steps: [
      'Indica la tonalidad y la progresión que quieres recorrer.',
      'Ajusta el tempo y las preferencias de ejercicio desde ajustes.',
      'Inicia el recorrido para oír los acordes y sus cambios.',
    ],
    tip: 'Puedes usar grados romanos (por ejemplo: I V vi IV) o acordes con notación inglesa (C G Am F).',
  },
  library: {
    title: 'Biblioteca de acordes',
    introduction: 'Consulta y organiza los acordes guardados en este navegador.',
    steps: [
      'Busca por nombre o tónica y combina la búsqueda con filtros de categorías.',
    ],
    tip: 'Marca acordes como favoritos para priorizar su selección en las herramientas.',
  },
};

/**
 * Muestra un diálogo accesible con instrucciones específicas de la página activa.
 * Al abrirse, bloquea el desplazamiento de fondo y gestiona el foco y el cierre
 * mediante Escape, clic fuera o el botón de cerrar.
 * @precondition `activeTab` identifica una pestaña válida, `isOpen` indica si
 * el diálogo debe mostrarse y `onClose` cierra el diálogo en el componente padre.
 * @postcondition Devuelve `null` si está cerrado; si está abierto, renderiza la
 * ayuda correspondiente y restaura el desplazamiento del documento al cerrarse.
 */
export const HelpDialog = ({ activeTab, isOpen, onClose }: HelpDialogProps) => {
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const content = HELP_CONTENT[activeTab];

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="help-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="help-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-dialog-title"
        aria-describedby="help-dialog-introduction"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="help-dialog-heading">
          <div>
            <p className="help-dialog-eyebrow">ChordNotebook · Ayuda</p>
            <h2 id="help-dialog-title">{content.title}</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="help-dialog-close"
            aria-label="Cerrar ayuda"
            onClick={onClose}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <p id="help-dialog-introduction" className="help-dialog-introduction">
          {content.introduction}
        </p>
        <ol className="help-dialog-steps">
          {content.steps.map((step) => <li key={step}>{step}</li>)}
        </ol>
        <p className="help-dialog-tip"><strong>Consejo:</strong> {content.tip}</p>
      </section>
    </div>
  );
};
