import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useCachedAsset } from '@/hooks/useCachedAsset'
import { inviteePath, type ReferralUser } from '@/lib/user'

type Props = {
  referrals: ReferralUser[]
}

const PLACEHOLDER_SVG = (
  <svg height="100%" viewBox="0 -960 960 960" width="100%" fill="#d1d1d1" aria-hidden="true">
    <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" />
  </svg>
)

function ReferralAvatar({ referral }: { referral: ReferralUser }) {
  const photo = useCachedAsset(referral.profile_photo_path)
  const verified = referral.profile?.status === 'approved'
  const href = inviteePath(referral)
  const inner = (
    <>
      <div className={`sm-profile-logo${verified ? ' verified-ishanch-small' : ''}`}>
        {photo ? <img src={photo} alt={referral.name ?? ''} /> : PLACEHOLDER_SVG}
      </div>
      <div>
        <span>{referral.name}</span> <span>{referral.lastname}</span>
      </div>
    </>
  )

  if (!href) {
    return <div className="referral-row">{inner}</div>
  }

  return (
    <Link to={href} className="referral-row referral-row--link">
      {inner}
    </Link>
  )
}

export function ReferralsCard({ referrals }: Props) {
  const { t } = useTranslation()
  const communityText = t('desktop.your_community_count', { count: referrals.length })

  return (
    <div className="content-small">
      <h5>{communityText}</h5>

      {referrals.length > 0 ? (
        referrals.map((referral) => <ReferralAvatar key={referral.id} referral={referral} />)
      ) : (
        <div className="referral-row">
          <p className="muted">{t('desktop.no_referrals_yet')}</p>
        </div>
      )}
    </div>
  )
}
