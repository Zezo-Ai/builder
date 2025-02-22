import React, { useState, useCallback, useEffect } from 'react'
import { EnhancedIntercom } from 'decentraland-dapps/dist/containers/EnhancedIntercom'
import { getAnalytics, getAnonymousId } from 'decentraland-dapps/dist/modules/analytics/utils'
import { config } from 'config'
import { IntercomUserData } from './Intercom.types'

const APP_ID = config.get('INTERCOM_APP_ID', '')
const analytics = getAnalytics()

export const Intercom: React.FC = () => {
  const [intercomUserData, setIntercomUserData] = useState<IntercomUserData>()

  const analyticsReadyCallback = useCallback(() => {
    const dclAnonymousUserID = getAnonymousId()
    if (dclAnonymousUserID) {
      setIntercomUserData({ ...intercomUserData, anon_id: dclAnonymousUserID })
    }
  }, [intercomUserData])

  useEffect(() => {
    analytics?.ready(analyticsReadyCallback)
  }, [analyticsReadyCallback])

  return <EnhancedIntercom appId={APP_ID} data={intercomUserData} settings={{ alignment: 'right' }} />
}

export default Intercom
