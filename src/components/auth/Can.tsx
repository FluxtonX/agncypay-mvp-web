"use client";

import React from "react";
import { useApp } from "../../context/AppContext";
import { Permission, WorkspaceRole } from "../../types/workspace";

export interface CanProps {
  permission?: Permission;
  role?: WorkspaceRole | WorkspaceRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Can({
  permission,
  role,
  children,
  fallback = null,
}: CanProps) {
  const { state } = useApp();
  const { memberships = [], activeWorkspaceId, user } = state;

  const currentMembership = memberships.find(
    (m: any) => m.workspaceId === activeWorkspaceId
  );

  // If no membership found, check if user is admin
  const userRole = currentMembership?.role;
  const userPermissions = currentMembership?.permissions || [];

  if (permission && !userPermissions.includes(permission)) {
    // If user is admin/agency_admin/super_admin, they have implicit permissions
    const isAdmin =
      userRole === "admin" ||
      userRole === "agency_admin" ||
      userRole === "super_admin" ||
      user?.accountType === "brand" ||
      user?.accountType === "agency";

    if (!isAdmin) {
      return <>{fallback}</>;
    }
  }

  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (userRole && !roles.includes(userRole)) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}
