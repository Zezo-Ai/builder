import React, { useMemo, useCallback } from 'react'
import { Button, Icon, Popup } from 'decentraland-ui'
import { Network } from '@dcl/schemas'
import { NetworkButton } from 'decentraland-dapps/dist/containers'
import { t } from 'decentraland-dapps/dist/modules/translation/utils'
import { SyncStatus } from 'modules/item/types'
import { getItemsToPublish, getItemsWithChanges, isAllowedToPushChanges } from 'modules/item/utils'
import { CurationStatus } from 'modules/curations/types'
import { Props, PublishButtonAction } from './CollectionPublishButton.types'

export const getTPButtonActionLabel = (buttonAction: PublishButtonAction) => {
  switch (buttonAction) {
    case PublishButtonAction.PUSH_CHANGES:
      return t('third_party_collection_detail_page.push_changes')
    case PublishButtonAction.PUBLISH_AND_PUSH_CHANGES:
      return t('third_party_collection_detail_page.publish_and_push_changes')
    default:
      return t('third_party_collection_detail_page.publish')
  }
}

const CollectionPublishButton = (props: Props) => {
  const {
    collection,
    items,
    slots,
    isLinkedWearablesPaymentsEnabled,
    onClick,
    onNewClick,
    onPushChangesClick,
    itemsStatus,
    itemCurations,
    isLoadingItemCurations
  } = props

  const buttonAction = useMemo(() => {
    let action = PublishButtonAction.NONE
    const { willPublish, willPushChanges } = items.reduce(
      (acc, item) => {
        const status = itemsStatus[item.id]
        if (status === SyncStatus.UNPUBLISHED) {
          acc.willPublish = true
        } else if (
          isAllowedToPushChanges(
            item,
            status,
            itemCurations.find(itemCuration => itemCuration.itemId === item.id && itemCuration.status === CurationStatus.PENDING)
          )
        ) {
          acc.willPushChanges = true
        }
        return acc
      },
      {
        willPublish: false,
        willPushChanges: false
      }
    )
    const isJustPushingChanges = willPushChanges && !willPublish
    const isJustPublishing = willPublish && !willPushChanges
    const isPublishingAndPushing = willPushChanges && willPublish
    if (isJustPushingChanges) {
      action = PublishButtonAction.PUSH_CHANGES
    } else if (isJustPublishing) {
      action = PublishButtonAction.PUBLISH
    } else if (isPublishingAndPushing) {
      action = PublishButtonAction.PUBLISH_AND_PUSH_CHANGES
    }
    return action
  }, [itemCurations, itemsStatus, items])

  const handleOnClick = useCallback(() => {
    const itemsToPublish = getItemsToPublish(items, itemsStatus)
    const itemsToPushChanges = getItemsWithChanges(items, itemsStatus, itemCurations)
    if (isLinkedWearablesPaymentsEnabled && itemsToPublish.length > 0) {
      onNewClick(collection.id, itemsToPushChanges, itemsToPublish)
    } else if (isLinkedWearablesPaymentsEnabled && itemsToPushChanges.length > 0) {
      onPushChangesClick(collection.id, itemsToPushChanges)
    } else {
      const itemIds = items.map(item => item.id)
      onClick(collection.id, itemIds, buttonAction)
    }
  }, [
    collection,
    items,
    buttonAction,
    onClick,
    onNewClick,
    onPushChangesClick,
    isLinkedWearablesPaymentsEnabled,
    itemsStatus,
    itemCurations
  ])

  const itemsTryingToPublish = useMemo(
    () => items.filter(item => !itemCurations?.find(itemCuration => itemCuration.itemId === item.id)).length,
    [items, itemCurations]
  )

  const underReviewButtonLabel = useMemo(() => {
    switch (buttonAction) {
      case PublishButtonAction.PUBLISH:
        if (itemsTryingToPublish) {
          return t('third_party_collection_detail_page.cant_publish_items', { count: itemsTryingToPublish })
        }
        return t('third_party_collection_detail_page.cant_publish')
      case PublishButtonAction.PUBLISH_AND_PUSH_CHANGES:
        return t('third_party_collection_detail_page.cant_publish_and_push_changes', { count: itemsTryingToPublish })
      default:
        return t('third_party_collection_detail_page.cant_publish')
    }
  }, [buttonAction, itemsTryingToPublish])

  const hasPendingItemCurations = itemCurations && !!itemCurations.find(ic => ic.status === CurationStatus.PENDING)
  const isTryingToPublish = [PublishButtonAction.PUBLISH, PublishButtonAction.PUBLISH_AND_PUSH_CHANGES].includes(buttonAction)
  const hasEnoughSlots = slots >= items.length || slots > 0 || isLinkedWearablesPaymentsEnabled

  return !isLoadingItemCurations && hasPendingItemCurations && (isTryingToPublish || buttonAction === PublishButtonAction.NONE) ? (
    <Popup
      content={underReviewButtonLabel}
      position="bottom center"
      trigger={
        <div className="popup-button">
          <Button primary disabled={true}>
            {t('collection_detail_page.under_review')}
          </Button>
        </div>
      }
      hideOnScroll={true}
      on="hover"
      inverted
    />
  ) : (
    <Popup
      content={t('third_party_collection_detail_page.exceeds_available_slots')}
      position="bottom center"
      trigger={
        <div className="popup-button">
          <NetworkButton
            loading={isLoadingItemCurations}
            disabled={(isTryingToPublish && !hasEnoughSlots) || items.length === 0 || buttonAction === PublishButtonAction.NONE}
            primary
            onClick={handleOnClick}
            network={Network.MATIC}
          >
            <Icon name="upload" />
            {getTPButtonActionLabel(buttonAction)}
          </NetworkButton>
        </div>
      }
      hideOnScroll={true}
      disabled={!isTryingToPublish || (isTryingToPublish && hasEnoughSlots)}
      on="hover"
      inverted
    />
  )
}

export default React.memo(CollectionPublishButton)
