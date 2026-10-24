import { FormEvent, useEffect, useState } from 'react'
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import {
  fetchAccessSettings,
  lookupAccessUser,
  removeAccess,
  storeAccess,
  type AccessRoleOption,
  type AccessSettingsPayload,
  type AccessUserRow,
} from '@/lib/business'
import {
  localizeCompanyRoleDescription,
  localizeCompanyRoleTitle,
} from '@/lib/companyRoles'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

const ROLE_ICON_MAP: Record<string, string> = {
  owner: 'fa-solid fa-crown',
  admin: 'fa-solid fa-shield-halved',
  manager: 'fa-solid fa-briefcase',
  sales_full_manager: 'fa-solid fa-chart-line',
  sales_manager: 'fa-solid fa-cash-register',
  accountant: 'fa-solid fa-calculator',
  analyser: 'fa-solid fa-chart-pie',
  hr: 'fa-solid fa-users-gear',
}

export function CompanyAccessSettingsPage() {
  const { t } = useTranslation()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const isOwner = Boolean(business.permissions?.isOwner)

  const [payload, setPayload] = useState<AccessSettingsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<AccessUserRow | null>(null)

  const [email, setEmail] = useState('')
  const [roleCode, setRoleCode] = useState('')
  const [password, setPassword] = useState('')
  const [lookupUser, setLookupUser] = useState<AccessUserRow['user'] | null>(null)
  const [lookupHint, setLookupHint] = useState('')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const reload = async () => {
    if (!token || !companyId) return
    const data = await fetchAccessSettings(token, companyId)
    setPayload(data)
    if (!roleCode && data.roleOptions[0]) setRoleCode(data.roleOptions[0].code)
  }

  useEffect(() => {
    if (!token || !companyId || !isOwner) return
    let active = true
    setLoading(true)
    void reload()
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyId, isOwner])

  if (!isOwner) {
    return <Navigate to={businessPath(companyId, 'settings')} replace />
  }

  const roles: AccessRoleOption[] = payload?.roleOptions || []

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setLookupUser(null)
    setLookupHint('')
    setFormError(null)
    setRoleCode(roles[0]?.code || '')
  }

  const doLookup = async () => {
    if (!token || !email.trim()) return
    setFormError(null)
    setLookupHint('')
    setBusy(true)
    try {
      const res = await lookupAccessUser(token, companyId, email.trim())
      setLookupUser(res.user)
      if (res.existing_access) {
        setLookupHint(
          `${t('desktop.existing_access')}: ${localizeCompanyRoleTitle(
            res.existing_access.role_code,
            t,
            res.existing_access.role_title || res.existing_access.role_code,
          )}`,
        )
        if (res.existing_access.role_code) setRoleCode(res.existing_access.role_code)
      }
    } catch (err) {
      setLookupUser(null)
      setFormError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const submitCreate = async (e: FormEvent) => {
    e.preventDefault()
    if (!token) return
    setBusy(true)
    setFormError(null)
    try {
      const msg = await storeAccess(token, companyId, {
        email: email.trim(),
        role_code: roleCode,
        password,
      })
      showSuccessToast(msg)
      setCreateOpen(false)
      resetForm()
      await reload()
    } catch (err) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const submitUpdate = async (e: FormEvent) => {
    e.preventDefault()
    if (!token || !selected?.user?.email) return
    setBusy(true)
    setFormError(null)
    try {
      const msg = await storeAccess(token, companyId, {
        email: selected.user.email,
        role_code: roleCode,
        password,
      })
      showSuccessToast(msg)
      setUpdateOpen(false)
      setSelected(null)
      setPassword('')
      await reload()
    } catch (err) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const submitDelete = async (e: FormEvent) => {
    e.preventDefault()
    if (!token || !selected) return
    setBusy(true)
    setFormError(null)
    try {
      const msg = await removeAccess(token, companyId, selected.id, password)
      showSuccessToast(msg)
      setDeleteOpen(false)
      setSelected(null)
      setPassword('')
      await reload()
    } catch (err) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="dash-div company-settings-page no-print" dir="rtl">
      <div className="content-small content-small--access">
        <div className="cs-back">
          <Link to={businessPath(companyId, 'settings')}>
            <i className="fa-solid fa-reply" />
            {t('desktop.return')}
          </Link>
        </div>
        <h5 className="cs-title">{t('desktop.company_user_access')}</h5>
        <p className="text-center cs-muted" style={{ marginBottom: 12 }}>
          {t('desktop.company_user_access_hint')}
        </p>

        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            resetForm()
            setCreateOpen(true)
          }}
        >
          <i className="fa-solid fa-plus" /> {t('desktop.add_user_access')}
        </button>

        {loading ? <div className="spinner" style={{ marginTop: 16 }} /> : null}
        {error ? <div className="alert-error">{error}</div> : null}

        <div className="cs-access-layout">
          <section className="cs-access-panel">
            <div className="cs-access-panel__head">
              <h6>{t('desktop.company_user_access')}</h6>
              <p>{t('desktop.company_user_access_hint')}</p>
            </div>
            <div className="cs-access-panel__body">
              <div className="cs-access-list cs-access-list--panel">
                {payload?.ownerUser ? (
                  <div className="cs-access-card">
                    <div className="cs-access-card__meta">
                      <div className="cs-access-card__name">{payload.ownerUser.name}</div>
                      <div className="cs-access-card__email">{payload.ownerUser.email}</div>
                      <div className="cs-access-card__role">
                        {localizeCompanyRoleTitle('owner', t, t('desktop.role_owner'))}
                      </div>
                      <div className="cs-muted">{t('desktop.owner_full_access_note')}</div>
                    </div>
                  </div>
                ) : null}

                {(payload?.accessUsers || []).map((row) => (
                  <div className="cs-access-card" key={row.id}>
                    <div className="cs-access-card__meta">
                      <div className="cs-access-card__name">{row.user.name}</div>
                      <div className="cs-access-card__email">{row.user.email}</div>
                      <div className="cs-access-card__role">
                        {localizeCompanyRoleTitle(row.role.code, t, row.role.title || row.role.code)}
                      </div>
                      {localizeCompanyRoleDescription(row.role.code, t, row.role.description) ? (
                        <div className="cs-muted">
                          {localizeCompanyRoleDescription(row.role.code, t, row.role.description)}
                        </div>
                      ) : null}
                      {row.granted_by_name ? (
                        <div className="cs-muted">
                          {t('desktop.granted_by')}: {row.granted_by_name}
                        </div>
                      ) : null}
                    </div>
                    <div className="cs-actions">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => {
                          setSelected(row)
                          setRoleCode(row.role.code || roles[0]?.code || '')
                          setPassword('')
                          setFormError(null)
                          setUpdateOpen(true)
                        }}
                      >
                        {t('desktop.edit')}
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => {
                          setSelected(row)
                          setPassword('')
                          setFormError(null)
                          setDeleteOpen(true)
                        }}
                      >
                        {t('desktop.delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="cs-access-panel">
            <div className="cs-access-panel__head">
              <h6>{t('desktop.access_roles_guide_title')}</h6>
              <p>{t('desktop.access_roles_guide_subtitle')}</p>
            </div>
            <div className="cs-access-panel__body">
              <div className="cs-roles-guide">
                <article className="cs-role-guide-card">
                  <div className="cs-role-guide-card__top">
                    <div className="cs-role-guide-card__icon" aria-hidden="true">
                      <i className={ROLE_ICON_MAP.owner} />
                    </div>
                    <div className="cs-role-guide-card__title-row">
                      <div className="cs-role-guide-card__title">
                        {localizeCompanyRoleTitle('owner', t, t('desktop.role_owner'))}
                      </div>
                      <span className="cs-role-guide-card__badge">{t('desktop.access_role_badge')}</span>
                    </div>
                  </div>
                  <p className="cs-role-guide-card__desc">
                    {localizeCompanyRoleDescription('owner', t, t('desktop.owner_full_access_note'))}
                  </p>
                </article>

                {roles.map((role) => {
                  const title = localizeCompanyRoleTitle(role.code, t, role.title)
                  const description = localizeCompanyRoleDescription(role.code, t, role.description)
                  return (
                    <article className="cs-role-guide-card" key={role.code}>
                      <div className="cs-role-guide-card__top">
                        <div className="cs-role-guide-card__icon" aria-hidden="true">
                          <i className={ROLE_ICON_MAP[role.code] || 'fa-regular fa-circle-user'} />
                        </div>
                        <div className="cs-role-guide-card__title-row">
                          <div className="cs-role-guide-card__title">{title}</div>
                          <span className="cs-role-guide-card__badge">{t('desktop.access_role_badge')}</span>
                        </div>
                      </div>
                      {description ? <p className="cs-role-guide-card__desc">{description}</p> : null}
                    </article>
                  )
                })}
              </div>
            </div>
          </section>
        </div>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('desktop.add_user_access')}
      >
        <form className="form-grid" onSubmit={(e) => void submitCreate(e)} dir="rtl">
          {formError ? <div className="alert-error">{formError}</div> : null}
          <label>
            {t('desktop.email')}
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="eng-input"
              />
              <button type="button" className="btn-secondary" disabled={busy} onClick={() => void doLookup()}>
                {t('desktop.search')}
              </button>
            </div>
          </label>
          {lookupUser ? (
            <div className="cs-muted">
              {lookupUser.name} — {lookupUser.email}
              {lookupHint ? <div>{lookupHint}</div> : null}
            </div>
          ) : null}
          <label>
            {t('desktop.role')}
            <select value={roleCode} onChange={(e) => setRoleCode(e.target.value)} required>
              {roles.map((role) => (
                <option key={role.code} value={role.code}>
                  {localizeCompanyRoleTitle(role.code, t, role.title)}
                </option>
              ))}
            </select>
          </label>
          {roleCode ? (
            <p className="cs-muted" style={{ margin: 0 }}>
              {localizeCompanyRoleDescription(
                roleCode,
                t,
                roles.find((r) => r.code === roleCode)?.description,
              )}
            </p>
          ) : null}
          <label>
            {t('desktop.owner_password')}
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="eng-input"
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setCreateOpen(false)}>
              {t('desktop.cancel')}
            </button>
            <button className="btn-primary" disabled={busy}>
              {busy ? t('desktop.processing') : t('desktop.save')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={updateOpen}
        onClose={() => setUpdateOpen(false)}
        title={t('desktop.edit_user_access')}
      >
        <form className="form-grid" onSubmit={(e) => void submitUpdate(e)} dir="rtl">
          {formError ? <div className="alert-error">{formError}</div> : null}
          <div className="cs-muted">
            {selected?.user.name} — {selected?.user.email}
          </div>
          <label>
            {t('desktop.role')}
            <select value={roleCode} onChange={(e) => setRoleCode(e.target.value)} required>
              {roles.map((role) => (
                <option key={role.code} value={role.code}>
                  {localizeCompanyRoleTitle(role.code, t, role.title)}
                </option>
              ))}
            </select>
          </label>
          {roleCode ? (
            <p className="cs-muted" style={{ margin: 0 }}>
              {localizeCompanyRoleDescription(
                roleCode,
                t,
                roles.find((r) => r.code === roleCode)?.description,
              )}
            </p>
          ) : null}
          <label>
            {t('desktop.owner_password')}
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="eng-input"
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setUpdateOpen(false)}>
              {t('desktop.cancel')}
            </button>
            <button className="btn-primary" disabled={busy}>
              {busy ? t('desktop.processing') : t('desktop.save')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t('desktop.delete_user_access')}
      >
        <form className="form-grid" onSubmit={(e) => void submitDelete(e)} dir="rtl">
          {formError ? <div className="alert-error">{formError}</div> : null}
          <p>
            {t('desktop.confirm_delete_access')}: <strong>{selected?.user.name}</strong>
          </p>
          <label>
            {t('desktop.owner_password')}
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="eng-input"
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setDeleteOpen(false)}>
              {t('desktop.cancel')}
            </button>
            <button className="btn-danger" disabled={busy}>
              {busy ? t('desktop.processing') : t('desktop.delete')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
