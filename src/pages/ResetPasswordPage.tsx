import { Navigate } from 'react-router-dom'

/** Legacy token links redirect to the code-based recovery page. */
export function ResetPasswordPage() {
  return <Navigate to="/forgot-password" replace />
}
