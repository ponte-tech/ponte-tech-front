// Utilitários para melhorar a acessibilidade da aplicação

import React from "react";

/**
 * Gera IDs únicos para elementos que precisam de identificação
 */
export const generateId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Utilitários para navegação por teclado
 */
export const keyboardNavigation = {
  /**
   * Manipula eventos de teclado para elementos clicáveis
   */
  handleKeyDown: (event: React.KeyboardEvent, callback: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  },

  /**
   * Manipula navegação por setas em listas
   */
  handleArrowNavigation: (
    event: React.KeyboardEvent,
    currentIndex: number,
    totalItems: number,
    onIndexChange: (index: number) => void
  ) => {
    let newIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = totalItems - 1;
        break;
      default:
        return;
    }
    
    onIndexChange(newIndex);
  },
};

/**
 * Utilitários para ARIA labels e descrições
 */
export const ariaUtils = {
  /**
   * Gera ARIA label para cards de vaga
   */
  getVacancyCardLabel: (title: string, company?: string, workMode?: string) => {
    const parts = [title];
    if (company) parts.push(`na empresa ${company}`);
    if (workMode) parts.push(`modalidade ${workMode}`);
    return parts.join(', ');
  },

  /**
   * Gera ARIA label para filtros
   */
  getFilterLabel: (filterType: string, selectedCount: number) => {
    if (selectedCount === 0) {
      return `Filtro ${filterType}, nenhum item selecionado`;
    }
    return `Filtro ${filterType}, ${selectedCount} ${selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}`;
  },

  /**
   * Gera ARIA label para paginação
   */
  getPaginationLabel: (currentPage: number, totalPages: number) => {
    return `Página ${currentPage} de ${totalPages}`;
  },

  /**
   * Gera ARIA live region para atualizações dinâmicas
   */
  getLiveRegionText: (type: 'search' | 'filter' | 'page', count: number) => {
    switch (type) {
      case 'search':
        return `${count} ${count === 1 ? 'vaga encontrada' : 'vagas encontradas'}`;
      case 'filter':
        return `Filtros aplicados, ${count} ${count === 1 ? 'vaga disponível' : 'vagas disponíveis'}`;
      case 'page':
        return `Página carregada, mostrando ${count} ${count === 1 ? 'vaga' : 'vagas'}`;
      default:
        return '';
    }
  },
};

/**
 * Utilitários para contraste e cores acessíveis
 */
export const colorUtils = {
  /**
   * Verifica se uma cor tem contraste suficiente
   */
  hasGoodContrast: (foreground: string, background: string): boolean => {
    // Implementação simplificada - em produção, usar biblioteca como 'color-contrast'
    // Por enquanto, retorna true para cores pré-definidas que sabemos que têm bom contraste
    const goodCombinations = [
      ['#1f2937', '#ffffff'], // texto escuro em fundo branco
      ['#ffffff', '#6366f1'], // texto branco em fundo azul
      ['#6b7280', '#ffffff'], // texto cinza em fundo branco
    ];
    
    return goodCombinations.some(([fg, bg]) => 
      (fg === foreground && bg === background) || 
      (fg === background && bg === foreground)
    );
  },

  /**
   * Cores acessíveis pré-definidas
   */
  accessible: {
    primary: '#6366f1',
    primaryContrast: '#ffffff',
    secondary: '#f59e0b',
    secondaryContrast: '#ffffff',
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      disabled: '#9ca3af',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
      disabled: '#f3f4f6',
    },
    border: {
      default: '#e5e7eb',
      focus: '#6366f1',
      error: '#ef4444',
    },
  },
};

/**
 * Utilitários para foco e navegação
 */
export const focusUtils = {
  /**
   * Estilos de foco acessíveis
   */
  focusStyles: {
    outline: '2px solid #6366f1',
    outlineOffset: '2px',
    borderRadius: '4px',
  },

  /**
   * Estilos de foco para elementos interativos
   */
  interactiveFocusStyles: {
    '&:focus': {
      outline: '2px solid #6366f1',
      outlineOffset: '2px',
    },
    '&:focus:not(:focus-visible)': {
      outline: 'none',
    },
    '&:focus-visible': {
      outline: '2px solid #6366f1',
      outlineOffset: '2px',
    },
  },

  /**
   * Gerencia foco em elementos dinâmicos
   */
  manageFocus: {
    /**
     * Move foco para um elemento específico
     */
    moveTo: (elementId: string) => {
      const element = document.getElementById(elementId);
      if (element) {
        element.focus();
      }
    },

    /**
     * Retorna foco para elemento anterior
     */
    returnToPrevious: (previousElementId: string) => {
      setTimeout(() => {
        const element = document.getElementById(previousElementId);
        if (element) {
          element.focus();
        }
      }, 100);
    },

    /**
     * Captura foco em modal/drawer
     */
    trapInContainer: (containerId: string) => {
      const container = document.getElementById(containerId);
      if (!container) return;

      const focusableElements = container.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      container.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => {
        container.removeEventListener('keydown', handleTabKey);
      };
    },
  },
};

/**
 * Utilitários para anúncios de tela
 */
export const screenReaderUtils = {
  /**
   * Anuncia mudanças para leitores de tela
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  /**
   * Classe CSS para elementos apenas para leitores de tela
   */
  srOnlyClass: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

/**
 * Validadores de acessibilidade
 */
export const accessibilityValidators = {
  /**
   * Valida se um elemento tem label adequado
   */
  hasValidLabel: (element: HTMLElement): boolean => {
    return !!(
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim()
    );
  },

  /**
   * Valida se um formulário tem labels adequados
   */
  hasValidFormLabels: (formElement: HTMLFormElement): boolean => {
    const inputs = formElement.querySelectorAll('input, select, textarea');
    return Array.from(inputs).every(input => {
      return !!(
        input.getAttribute('aria-label') ||
        input.getAttribute('aria-labelledby') ||
        formElement.querySelector(`label[for="${input.id}"]`)
      );
    });
  },

  /**
   * Valida se elementos interativos são acessíveis por teclado
   */
  isKeyboardAccessible: (element: HTMLElement): boolean => {
    const tabIndex = element.getAttribute('tabindex');
    const isInteractive = ['button', 'a', 'input', 'select', 'textarea'].includes(
      element.tagName.toLowerCase()
    );
    
    return isInteractive || (tabIndex !== null && parseInt(tabIndex) >= 0);
  },
};

/**
 * Hook personalizado para gerenciar estado de acessibilidade
 */
export const useAccessibility = () => {
  const [announcements, setAnnouncements] = React.useState<string[]>([]);
  
  const announce = (message: string) => {
    setAnnouncements(prev => [...prev, message]);
    screenReaderUtils.announce(message);
    
    // Remove announcement after delay
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 5000);
  };

  return {
    announce,
    announcements,
  };
};

