type AuthBadgeProps = {
  children: string
}

export function AuthBadge({ children }: AuthBadgeProps) {
  return <span className="auth-badge">{children}</span>
}
