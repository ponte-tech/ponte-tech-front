import { ReactNode } from "react";
import { Box, Tooltip, useTheme } from "@mui/material";
import { useAuth } from "@/app/hooks/useAuth";
import { hasPermission, hasAnyPermission, hasAllPermissions } from "@/app/utils/permissions";

type Permission =
  | "admin:usuarios"
  | "admin:timesheet_config"
  | "admin:fiscal_config"
  | "admin:feriados"
  | "admin:aprovar_fechamentos"
  | "admin:aprovar_notas"
  | "admin:auditoria"
  | "colaborador:timesheet"
  | "colaborador:fiscal"
  | "colaborador:enviar_notas"
  | "contador:fiscal_view"
  | "contador:download_notas"
  | "vendedor:cursos"
  | "vendedor:vendas"
  | "vendedor:matriculas"
  | "professor:cursos"
  | "professor:aulas"
  | "aluno:ver_cursos"
  | "aluno:matriculas";

interface ProtectedActionProps {
  permission: Permission | Permission[];
  requireAll?: boolean;
  children: ReactNode;
  fallback?: ReactNode;
  disabledMessage?: string;
}

/**
 * Componente que renderiza children apenas se o usuário tem permissão
 * Caso não tenha permissão, renderiza fallback (ou nada)
 */
export function ProtectedAction({
  permission,
  requireAll = false,
  children,
  fallback = null,
  disabledMessage = "Você não tem permissão para realizar esta ação",
}: ProtectedActionProps) {
  const { user } = useAuth();

  const hasAccess = Array.isArray(permission)
    ? requireAll
      ? hasAllPermissions(user?.userType as any, permission)
      : hasAnyPermission(user?.userType as any, permission)
    : hasPermission(user?.userType as any, permission);

  if (hasAccess) {
    return <>{children}</>;
  }

  return fallback ? <>{fallback}</> : null;
}

/**
 * HOC para proteger um componente inteiro com permissões
 */
export function withProtectedAction<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission | Permission[],
  requireAll?: boolean
) {
  return function ProtectedComponent(props: P) {
    return (
      <ProtectedAction permission={permission} requireAll={requireAll}>
        <Component {...props} />
      </ProtectedAction>
    );
  };
}

/**
 * Hook para usar em componentes
 */
export function usePermission(permission: Permission | Permission[], requireAll = false) {
  const { user } = useAuth();

  const hasAccess = Array.isArray(permission)
    ? requireAll
      ? hasAllPermissions(user?.userType as any, permission)
      : hasAnyPermission(user?.userType as any, permission)
    : hasPermission(user?.userType as any, permission);

  return hasAccess;
}
