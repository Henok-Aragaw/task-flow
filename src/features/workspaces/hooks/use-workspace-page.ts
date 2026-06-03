"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCreateProject, useProjects } from "@/features/projects/queries";
import { createClient } from "@/lib/supabase/client";
import {
  useDeleteWorkspace,
  useUpdateWorkspace,
  useWorkspace,
  useWorkspaceMembers,
} from "../queries";

export function useWorkspacePage(workspaceId: string) {
  const router = useRouter();
  const supabase = createClient();
  const workspaceQuery = useWorkspace(workspaceId);
  const projectsQuery = useProjects(workspaceId);
  const membersQuery = useWorkspaceMembers(workspaceId);
  const createProjectMutation = useCreateProject(workspaceId);
  const updateWorkspaceMutation = useUpdateWorkspace();
  const deleteWorkspaceMutation = useDeleteWorkspace();

  const [projectOpen, setProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setCurrentUserId(data.user.id);
    });
  }, [supabase]);

  useEffect(() => {
    if (workspaceQuery.data?.name) {
      setEditName(workspaceQuery.data.name);
    }
  }, [workspaceQuery.data?.name]);

  const isOwner =
    membersQuery.data?.some(
      (member) => member.user_id === currentUserId && member.role === "owner",
    ) ?? false;

  const createProject = (event: FormEvent) => {
    event.preventDefault();
    const name = projectName.trim();
    if (!name) return;

    createProjectMutation.mutate(
      { name, workspace_id: workspaceId },
      {
        onSuccess: () => {
          setProjectName("");
          setProjectOpen(false);
        },
      },
    );
  };

  const updateWorkspace = (event: FormEvent) => {
    event.preventDefault();
    const name = editName.trim();
    if (!name) return;

    updateWorkspaceMutation.mutate(
      { workspaceId, name },
      {
        onSuccess: () => {
          setEditOpen(false);
        },
      },
    );
  };

  const deleteWorkspace = () => {
    deleteWorkspaceMutation.mutate(workspaceId, {
      onSuccess: () => {
        setDeleteOpen(false);
        router.push("/dashboard");
      },
    });
  };

  const inviteMember = async (event: FormEvent) => {
    event.preventDefault();
    const email = inviteEmail.trim().toLowerCase();
    if (!email || isInviting) return;

    setIsInviting(true);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (profileError) throw new Error(profileError.message);
      if (!profile) {
        toast.error("User with this email is not signed up in the system yet.");
        return;
      }

      const isAlreadyMember = membersQuery.data?.some(
        (member) => member.user_id === profile.id,
      );
      if (isAlreadyMember) {
        toast.warning("This user is already a member of this workspace.");
        return;
      }

      const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspaceId,
          user_id: profile.id,
          role: "member",
        });

      if (memberError) throw new Error(memberError.message);

      toast.success("User added to workspace successfully!");
      setInviteEmail("");
      setInviteOpen(false);
      membersQuery.refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to add user: ${message}`);
    } finally {
      setIsInviting(false);
    }
  };

  return {
    workspace: workspaceQuery.data,
    projects: projectsQuery.data,
    members: membersQuery.data,
    isLoading:
      workspaceQuery.isLoading ||
      projectsQuery.isLoading ||
      membersQuery.isLoading,
    isProjectsLoading: projectsQuery.isLoading,
    isMembersLoading: membersQuery.isLoading,
    isOwner,
    createProjectMutation,
    projectDialog: {
      open: projectOpen,
      setOpen: setProjectOpen,
      name: projectName,
      setName: setProjectName,
      submit: createProject,
    },
    inviteDialog: {
      open: inviteOpen,
      setOpen: setInviteOpen,
      email: inviteEmail,
      setEmail: setInviteEmail,
      isSubmitting: isInviting,
      submit: inviteMember,
    },
    editDialog: {
      open: editOpen,
      setOpen: setEditOpen,
      name: editName,
      setName: setEditName,
      submit: updateWorkspace,
      isPending: updateWorkspaceMutation.isPending,
    },
    deleteDialog: {
      open: deleteOpen,
      setOpen: setDeleteOpen,
      submit: deleteWorkspace,
      isPending: deleteWorkspaceMutation.isPending,
    },
  };
}
