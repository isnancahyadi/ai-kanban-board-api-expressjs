interface RawUser {
  id: string | number;
  name: string;
  email: string;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  createdAt?: Date | string | null;
  created_at?: Date | string | null;
  [key: string]: unknown;
}

export const formatUserResponse = <T extends RawUser>(user: T) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? user.avatar_url ?? null,
    createdAt: user.createdAt ?? user.created_at ?? null,
  };
};
