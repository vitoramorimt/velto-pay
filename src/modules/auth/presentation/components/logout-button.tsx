import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOutAction } from "@/modules/auth/application/auth-actions";

export function LogoutButton() {
  return (
    <form action={signOutAction}>
      <Button type="submit" variant="outline">
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    </form>
  );
}
