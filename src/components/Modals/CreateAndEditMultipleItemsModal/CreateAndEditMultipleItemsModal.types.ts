import { Dispatch } from 'redux'
import { Content } from '@dcl/builder-client'
import { ModalProps } from 'decentraland-dapps/dist/providers/ModalProvider/ModalProvider.types'
import {
  SaveMultipleItemsRequestAction,
  CancelSaveMultipleItemsAction,
  ClearStateSaveMultipleItemsAction,
  cancelSaveMultipleItems,
  saveMultipleItemsRequest,
  clearSaveMultipleItems
} from 'modules/item/actions'
import {
  getSavedItemsFiles,
  getNotSavedItemsFiles,
  getCanceledItemsFiles,
  getMultipleItemsSaveState
} from 'modules/ui/createMultipleItems/selectors'
import { BuiltFile } from 'modules/item/types'
import { Collection } from 'modules/collection/types'
import { SetThirdPartyTypeRequestAction } from 'modules/thirdParty/actions'
import { ThirdParty } from 'modules/thirdParty/types'

export enum CreateOrEditMultipleItemsModalType {
  CREATE,
  EDIT
}

export enum LoadingFilesState {
  LOADING_FILES,
  CREATING_ITEMS
}
export enum ItemCreationView {
  IMPORT,
  IMPORTING,
  REVIEW,
  UPLOADING,
  COMPLETED,
  THIRD_PARTY_KIND_SELECTOR
}
export enum ImportedFileType {
  ACCEPTED,
  REJECTED
}

export type RejectedFile = { fileName: string; reason: string }
export type ImportedFile<T extends Content> = { type: ImportedFileType } & (BuiltFile<T> | RejectedFile)
export type CreateAndEditMultipleItemsModalMetadata = {
  collectionId?: string
  type?: CreateOrEditMultipleItemsModalType
}

export type Props = Omit<ModalProps, 'metadata'> & {
  collection: Collection | null
  thirdParty: ThirdParty | null
  error: string | null
  onSaveMultipleItems: typeof saveMultipleItemsRequest
  onCancelSaveMultipleItems: typeof cancelSaveMultipleItems
  onModalUnmount: typeof clearSaveMultipleItems
  onSetThirdPartyType: (thirdPartyId: string, isProgrammatic: boolean) => unknown
  savedItemsFiles: ReturnType<typeof getSavedItemsFiles>
  notSavedItemsFiles: ReturnType<typeof getNotSavedItemsFiles>
  cancelledItemsFiles: ReturnType<typeof getCanceledItemsFiles>
  saveMultipleItemsState: ReturnType<typeof getMultipleItemsSaveState>
  isLinkedWearablesV2Enabled: boolean
  isLinkedWearablesPaymentsEnabled: boolean
  isSettingThirdPartyType: boolean
  saveItemsProgress: number
  metadata: CreateAndEditMultipleItemsModalMetadata
}

export type OwnProps = Pick<Props, 'name' | 'metadata' | 'onClose'>
export type MapStateProps = Pick<
  Props,
  | 'savedItemsFiles'
  | 'notSavedItemsFiles'
  | 'cancelledItemsFiles'
  | 'error'
  | 'saveMultipleItemsState'
  | 'saveItemsProgress'
  | 'collection'
  | 'isLinkedWearablesV2Enabled'
  | 'isSettingThirdPartyType'
  | 'isLinkedWearablesPaymentsEnabled'
  | 'thirdParty'
>
export type MapDispatchProps = Pick<Props, 'onSaveMultipleItems' | 'onCancelSaveMultipleItems' | 'onModalUnmount' | 'onSetThirdPartyType'>
export type MapDispatch = Dispatch<
  SaveMultipleItemsRequestAction | CancelSaveMultipleItemsAction | ClearStateSaveMultipleItemsAction | SetThirdPartyTypeRequestAction
>
