import { UserProfile } from "@/app/types/api";

type Permission =
  // Admin
  | "admin:usuarios"
  | "admin:timesheet_config"
  | "admin:fiscal_config"
  | "admin:feriados"
  | "admin:aprovar_fechamentos"
  | "admin:aprovar_notas"
  | "admin:auditoria"

  // Colaborador
  | "colaborador:timesheet"
  | "colaborador:fiscal"
  | "colaborador:enviar_notas"

  // Contador
  | "contador:fiscal_view"
  | "contador:download_notas"

  // Vendedor
  | "vendedor:cursos"
  | "vendedor:vendas"
  | "vendedor:matriculas"

  // Professor
  | "professor:cursos"
  | "professor:aulas"

  // Aluno
  | "aluno:ver_cursos"
  | "aluno:matriculas";

type PermissionMap = {
  [key in UserProfile]: Permission[];
};

export const permissionMap: PermissionMap = {
  admin: [
    // Tudo para admin
    "admin:usuarios",
    "admin:timesheet_config",
    "admin:fiscal_config",
    "admin:feriados",
    "admin:aprovar_fechamentos",
    "admin:aprovar_notas",
    "admin:auditoria",
    "colaborador:timesheet",
    "colaborador:fiscal",
    "contador:fiscal_view",
    "vendedor:cursos",
    "vendedor:vendas",
    "vendedor:matriculas",
    "professor:cursos",
    "aluno:ver_cursos",
  ],

  colaborador: [
    "colaborador:timesheet",
    "colaborador:fiscal",
    "colaborador:enviar_notas",
  ],

  contador: [
    "contador:fiscal_view",
    "contador:download_notas",
    "colaborador:fiscal",
  ],

  vendedor: [
    "vendedor:cursos",
    "vendedor:vendas",
    "vendedor:matriculas",
    "aluno:ver_cursos",
  ],

  professor: [
    "professor:cursos",
    "professor:aulas",
    "aluno:ver_cursos",
  ],

  aluno: [
    "aluno:ver_cursos",
    "aluno:matriculas",
  ],
};

/**
 * Verifica se um perfil tem uma permissão específica
 */
export const hasPermission = (userProfile: UserProfile | undefined, permission: Permission): boolean => {
  if (!userProfile) return false;
  const permissions = permissionMap[userProfile] || [];
  return permissions.includes(permission);
};

/**
 * Verifica se um perfil tem qualquer uma das permissões
 */
export const hasAnyPermission = (userProfile: UserProfile | undefined, permissions: Permission[]): boolean => {
  if (!userProfile) return false;
  const userPermissions = permissionMap[userProfile] || [];
  return permissions.some((p) => userPermissions.includes(p));
};

/**
 * Verifica se um perfil tem todas as permissões
 */
export const hasAllPermissions = (userProfile: UserProfile | undefined, permissions: Permission[]): boolean => {
  if (!userProfile) return false;
  const userPermissions = permissionMap[userProfile] || [];
  return permissions.every((p) => userPermissions.includes(p));
};

/**
 * Retorna as ações permitidas para um perfil em uma página específica
 */
export const getAvailableActions = (userProfile: UserProfile | undefined, page: string): string[] => {
  if (!userProfile) return [];

  const actionMap: Record<string, Record<UserProfile, string[]>> = {
    "timesheet/fechamentos": {
      admin: ["aprovar", "rejeitar"],
      colaborador: ["visualizar"],
      contador: [],
      vendedor: [],
      professor: [],
      aluno: [],
    },
    "fiscal/admin": {
      admin: ["aprovar", "rejeitar", "marcar_pago"],
      colaborador: [],
      contador: ["visualizar"],
      vendedor: [],
      professor: [],
      aluno: [],
    },
    "usuarios": {
      admin: ["criar", "editar", "deletar"],
      colaborador: [],
      contador: [],
      vendedor: [],
      professor: [],
      aluno: [],
    },
  };

  return actionMap[page]?.[userProfile] || [];
};
