import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { PageFrame } from "../components/PageFrame";
import { loginSchema, type LoginFormValues } from "../features/auth/login-schema";

export function AdminLoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onChange",
  });

  function onSubmit(values: LoginFormValues) {
    console.log("Admin login form submitted", values);
  }

  return (
    <PageFrame
      eyebrow="Admin"
      title="Login"
      description="This is now a real form shell with client-side validation. The next step is to connect it to the backend auth endpoint and session handling."
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Username</span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              type="text"
              autoComplete="username"
              placeholder="admin"
              {...register("username")}
            />
            {errors.username ? (
              <p className="text-sm text-rose-600">{errors.username.message}</p>
            ) : null}
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500"
              type="password"
              autoComplete="current-password"
              placeholder="At least 8 characters"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-rose-600">{errors.password.message}</p>
            ) : null}
          </label>

          <button
            className="inline-flex rounded-full bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <aside className="rounded-[1.75rem] bg-emerald-950 px-6 py-7 text-emerald-50">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200/75">
            Admin Notes
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Backend-ready form contract</h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-emerald-50/85">
            <li>Username and password are validated before submit.</li>
            <li>The form shape is now stable enough to wire into `/api/auth/login`.</li>
            <li>Next step is handling auth failures and redirect on successful login.</li>
          </ul>
        </aside>
      </div>
    </PageFrame>
  );
}
