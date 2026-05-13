import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAdminSession, loginAdmin, logoutAdmin } from "@/lib/api/auth/auth";
import { authQueryKeys } from "@/features/auth/query/auth-query-keys";

export function useAdminSessionQuery() {
  return useQuery({
    queryKey: authQueryKeys.session,
    queryFn: fetchAdminSession,
  });
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      loginAdmin(username, password),
    onSuccess: (session) => {
      queryClient.setQueryData(authQueryKeys.session, session);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutAdmin,
    onSuccess: () => {
      queryClient.setQueryData(authQueryKeys.session, null);
    },
  });
}
