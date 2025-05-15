import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Role {
  id: number;
  name: string;
}

interface UserFormProps {
  user?: {
    id: number;
    name: string;
    email: string;
    roles: Role[];
  };
  roles: Role[];
}

export default function UserForm({ user, roles }: UserFormProps) {
  const { data, setData, post, put, processing, errors } = useForm({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    password_confirmation: "",
    roles: user?.roles.map(role => role.id) || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      put(`/users/${user.id}`, {
        onSuccess: () => {
          // Handle success
        },
      });
    } else {
      post("/users", {
        onSuccess: () => {
          // Handle success
        },
      });
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{user ? "Edit User" : "Create User"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={data.name}
              onChange={(e) => setData("name", e.target.value)}
              required
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData("email", e.target.value)}
              required
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => setData("password", e.target.value)}
              required={!user}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirmation">Confirm Password</Label>
            <Input
              id="password_confirmation"
              type="password"
              value={data.password_confirmation}
              onChange={(e) => setData("password_confirmation", e.target.value)}
              required={!user}
            />
          </div>

          <div className="space-y-2">
            <Label>Roles</Label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={data.roles.includes(role.id)}
                    onCheckedChange={(checked) => {
                      const newRoles = checked
                        ? [...data.roles, role.id]
                        : data.roles.filter((id) => id !== role.id);
                      setData("roles", newRoles);
                    }}
                  />
                  <Label htmlFor={`role-${role.id}`}>{role.name}</Label>
                </div>
              ))}
            </div>
            {errors.roles && <p className="text-red-500 text-sm">{errors.roles}</p>}
          </div>

          <Button type="submit" disabled={processing}>
            {processing ? "Saving..." : user ? "Update User" : "Create User"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 