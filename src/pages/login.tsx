import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, LogIn, Shield, UserRound } from 'lucide-react'
import { toast } from 'sonner'

import { AuthShell } from '@/components/auth-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { ApiError } from '@/lib/api'

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const redirectParam = searchParams.get('redirect') ?? '/'
  const redirect = redirectParam.startsWith('/') ? redirectParam : '/'

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginForm) {
    setServerError(null)
    try {
      const user = await login(values.email, values.password)
      toast.success(`Bienvenido de nuevo, ${user.name.split(' ')[0]}.`)
      navigate(redirect, { replace: true })
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'No se pudo iniciar sesión. Intenta de nuevo.'
      setServerError(message)
    }
  }

  function fillDemo(role: 'admin' | 'reader') {
    if (role === 'admin') {
      setValue('email', 'admin@lector.com', { shouldValidate: true })
      setValue('password', 'Admin123!', { shouldValidate: true })
    } else {
      setValue('email', 'lector@lector.com', { shouldValidate: true })
      setValue('password', 'Lector123!', { shouldValidate: true })
    }
    setServerError(null)
  }

  return (
    <AuthShell
      eyebrow="Bienvenido de vuelta"
      title="Inicia sesión"
      subtitle="Accede a tu biblioteca, retoma tus lecturas y comparte tus reseñas."
      footer={
        <>
          ¿Aún no tienes cuenta?{' '}
          <Link to="/registro" className="link-underline text-clay">
            Crear cuenta gratis
          </Link>
        </>
      }
    >
      <div className="mb-6 grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" size="sm" onClick={() => fillDemo('reader')}>
          <UserRound className="h-3.5 w-3.5" />
          Demo lector
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => fillDemo('admin')}>
          <Shield className="h-3.5 w-3.5" />
          Demo admin
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            {...register('email')}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <span className="text-xs text-ink-muted">Mínimo 8 caracteres</span>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              aria-invalid={Boolean(errors.password)}
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-ink-muted transition-colors hover:text-ink"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive">{errors.password.message}</p>
          )}
        </div>

        {serverError && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="h-4 w-4" />
          )}
          {isSubmitting ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
    </AuthShell>
  )
}
