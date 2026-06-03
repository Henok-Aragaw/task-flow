"use client";

import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { useWorkspacePage } from "../hooks/use-workspace-page";

type WorkspacePageModel = ReturnType<typeof useWorkspacePage>;

export function CreateProjectDialog({ model }: { model: WorkspacePageModel }) {
  return (
    <Dialog
      open={model.projectDialog.open}
      onOpenChange={model.projectDialog.setOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={model.projectDialog.submit}>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Project Name
              </label>
              <Input
                className="bg-background border-border text-foreground focus-visible:ring-primary/25"
                placeholder="e.g. Website Overhaul"
                value={model.projectDialog.name}
                onChange={(event) =>
                  model.projectDialog.setName(event.target.value)
                }
                required
                disabled={model.createProjectMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => model.projectDialog.setOpen(false)}
              disabled={model.createProjectMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={model.createProjectMutation.isPending}
            >
              {model.createProjectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InviteMemberDialog({ model }: { model: WorkspacePageModel }) {
  return (
    <Dialog
      open={model.inviteDialog.open}
      onOpenChange={model.inviteDialog.setOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Workspace Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={model.inviteDialog.submit}>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                User Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 bg-background border-border text-foreground placeholder-muted-foreground focus-visible:ring-primary/25"
                  placeholder="name@example.com"
                  type="email"
                  value={model.inviteDialog.email}
                  onChange={(event) =>
                    model.inviteDialog.setEmail(event.target.value)
                  }
                  required
                  disabled={model.inviteDialog.isSubmitting}
                />
              </div>
              <span className="text-xs text-muted-foreground block leading-normal mt-1">
                Note: The user must have already signed up for an account in
                TaskFlow to be added to this workspace.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => model.inviteDialog.setOpen(false)}
              disabled={model.inviteDialog.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={model.inviteDialog.isSubmitting}
            >
              {model.inviteDialog.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Member...
                </>
              ) : (
                "Invite Member"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function RenameWorkspaceDialog({
  model,
}: {
  model: WorkspacePageModel;
}) {
  return (
    <Dialog
      open={model.editDialog.open}
      onOpenChange={model.editDialog.setOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={model.editDialog.submit}>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">
                Workspace Name
              </label>
              <Input
                className="bg-background border-border text-foreground focus-visible:ring-primary/25"
                placeholder="e.g. Acme Corporation"
                value={model.editDialog.name}
                onChange={(event) =>
                  model.editDialog.setName(event.target.value)
                }
                required
                disabled={model.editDialog.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => model.editDialog.setOpen(false)}
              disabled={model.editDialog.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={model.editDialog.isPending}
            >
              {model.editDialog.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDeleteWorkspaceDialog({
  model,
}: {
  model: WorkspacePageModel;
}) {
  return (
    <Dialog
      open={model.deleteDialog.open}
      onOpenChange={model.deleteDialog.setOpen}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Workspace?</DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone. It will delete all
            projects, members, and tasks associated with this workspace.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="space-x-2">
          <Button
            variant="outline"
            className="border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => model.deleteDialog.setOpen(false)}
            disabled={model.deleteDialog.isPending}
          >
            Cancel
          </Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={model.deleteDialog.submit}
            disabled={model.deleteDialog.isPending}
          >
            {model.deleteDialog.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Workspace"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
