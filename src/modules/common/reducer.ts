import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import { History } from 'history'
import { authorizationReducer as authorization } from 'decentraland-dapps/dist/modules/authorization/reducer'
import { modalReducer as modal } from 'decentraland-dapps/dist/modules/modal/reducer'
import { profileReducer as profile } from 'decentraland-dapps/dist/modules/profile/reducer'
import { storageReducer as storage, storageReducerWrapper } from 'decentraland-dapps/dist/modules/storage/reducer'
import { toastReducer as toast } from 'decentraland-dapps/dist/modules/toast/reducer'
import { transactionReducer as transaction } from 'decentraland-dapps/dist/modules/transaction/reducer'
import { translationReducer as translation } from 'decentraland-dapps/dist/modules/translation/reducer'
import { walletReducer as wallet } from 'decentraland-dapps/dist/modules/wallet/reducer'
import { featuresReducer as features } from 'decentraland-dapps/dist/modules/features/reducer'
import { gatewayReducer as gateway } from 'decentraland-dapps/dist/modules/gateway/reducer'
import { campaignReducer as campaign } from 'decentraland-dapps/dist/modules/campaign'
import { creditsReducer as credits } from 'decentraland-dapps/dist/modules/credits/reducer'

import { RootState } from 'modules/common/types'
import { assetPackReducer as assetPack } from 'modules/assetPack/reducer'
import { assetReducer as asset } from 'modules/asset/reducer'
import { collectionReducer as collection } from 'modules/collection/reducer'
import { committeeReducer as committee } from 'modules/committee/reducer'
import { collectionCurationReducer as collectionCuration } from 'modules/curations/collectionCuration/reducer'
import { itemCurationReducer as itemCuration } from 'modules/curations/itemCuration/reducer'
import { deploymentReducer as deployment } from 'modules/deployment/reducer'
import { editorReducer as editor } from 'modules/editor/reducer'
import { ensReducer as ens } from 'modules/ens/reducer'
import { entityReducer as entity } from 'modules/entity/reducer'
import { identityReducer as identity } from 'modules/identity/reducer'
import { itemReducer as item } from 'modules/item/reducer'
import { landReducer as land } from 'modules/land/reducer'
import { mediaReducer as media } from 'modules/media/reducer'
import { poolGroupReducer as poolGroup } from 'modules/poolGroup/reducer'
import { poolReducer as pool } from 'modules/pool/reducer'
import { projectReducer as project } from 'modules/project/reducer'
import { sceneReducer as scene } from 'modules/scene/reducer'
import { statsReducer as stats } from 'modules/stats/reducer'
import { syncReducer as sync } from 'modules/sync/reducer'
import { thirdPartyReducer as thirdParty } from 'modules/thirdParty/reducer'
import { tileReducer as tile } from 'modules/tile/reducer'
import { uiReducer as ui } from 'modules/ui/reducer'
import { inspectorReducer as inspector } from 'modules/inspector/reducer'
import { worldsReducer as worlds } from 'modules/worlds/reducer'

export function createRootReducer(history: History) {
  return storageReducerWrapper(
    combineReducers<RootState>({
      asset,
      campaign,
      assetPack,
      authorization,
      collection,
      committee,
      collectionCuration,
      itemCuration,
      deployment,
      editor,
      ens,
      entity,
      identity,
      item,
      land,
      media,
      modal,
      pool,
      poolGroup,
      profile,
      project,
      router: connectRouter(history),
      scene,
      stats,
      storage,
      sync,
      thirdParty,
      tile,
      toast,
      transaction,
      translation,
      ui,
      wallet,
      features,
      inspector,
      worlds,
      gateway,
      credits
    })
  )
}
