import { ChainId, ContractAddress, ContractNetwork, Mapping, MappingType } from '@dcl/schemas'
import { saveCollectionSuccess } from 'modules/collection/actions'
import { Collection } from 'modules/collection/types'
import {
  finishPublishAndPushChangesThirdPartyItemsSuccess,
  FinishPublishAndPushChangesThirdPartyItemsSuccessAction,
  publishThirdPartyItemsSuccess,
  PublishThirdPartyItemsSuccessAction,
  pushChangesThirdPartyItemsSuccess,
  PushChangesThirdPartyItemsSuccessAction
} from 'modules/thirdParty/actions'
import { PaginatedResource } from 'lib/api/pagination'
import { CurationStatus } from 'modules/curations/types'
import { ThirdParty } from 'modules/thirdParty/types'
import { ItemCuration } from 'modules/curations/itemCuration/types'
import { getChainIdByNetwork } from 'decentraland-dapps/dist/lib/eth'
import {
  clearSaveMultipleItems,
  downloadItemFailure,
  downloadItemRequest,
  downloadItemSuccess,
  saveMultipleItemsCancelled,
  saveMultipleItemsSuccess,
  rescueItemsChunkSuccess,
  rescueItemsRequest,
  rescueItemsSuccess,
  fetchCollectionItemsSuccess,
  fetchOrphanItemRequest,
  fetchOrphanItemSuccess,
  fetchOrphanItemFailure
} from './actions'
import { INITIAL_STATE, itemReducer, ItemState } from './reducer'
import { Item } from './types'
import { toItemObject } from './utils'

jest.mock('decentraland-dapps/dist/lib/eth')
const getChainIdByNetworkMock: jest.Mock<typeof getChainIdByNetwork> = getChainIdByNetwork as unknown as jest.Mock<
  typeof getChainIdByNetwork
>

const error = 'something went wrong'
let state: ItemState
let items: Item[]
let itemsMap: Record<string, Item>
let fileNames: string[]

beforeEach(() => {
  const mappings: Partial<Record<ContractNetwork, Record<ContractAddress, Mapping[]>>> = {
    [ContractNetwork.AMOY]: { '0x0': [{ type: MappingType.ANY }] }
  }
  state = { ...INITIAL_STATE }
  items = [
    { id: 'anItemId', isPublished: false, mappings: mappings } as Item,
    { id: 'anotherItemId', isPublished: false, mappings: null } as Item
  ]
  itemsMap = {
    [items[0].id]: items[0],
    [items[1].id]: items[1]
  }
  fileNames = ['file1', 'file2']
})

describe('when reducing the save collection success action', () => {
  let fstItem: Item
  let sndItem: Item
  let thirdItem: Item
  let fstCollection: Collection
  let sndCollection: Collection
  let result: ItemState

  beforeEach(() => {
    fstItem = {
      id: 'fst-item',
      urn: 'urn:decentraland:goerli:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8:fst-token-id',
      collectionId: 'fst-collection-id'
    } as Item
    sndItem = {
      id: 'snd-item',
      urn: 'urn:decentraland:goerli:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8:snd-token-id',
      collectionId: 'fst-collection-id'
    } as Item
    thirdItem = {
      id: 'third-item',
      urn: 'urn:decentraland:matic:collections-thirdparty:tp-id:tp-collection-id:tp-token-id',
      collectionId: 'snd-collection-id'
    } as Item

    state.data = {
      [fstItem.id]: fstItem,
      [sndItem.id]: sndItem,
      [thirdItem.id]: thirdItem
    }
    fstCollection = {
      id: 'fst-collection-id',
      urn: 'urn:decentraland:goerli:collections-v2:0xc6d2000a7a1ddca92941f4e2b41360fe4ee2abd8'
    } as Collection
    sndCollection = {
      id: 'snd-collection-id',
      urn: 'urn:decentraland:matic:collections-thirdparty:tp-id:tp-collection-id'
    } as Collection
  })

  describe('and the collection is a third party collection', () => {
    let newCollectionAddress: string

    beforeEach(() => {
      newCollectionAddress = '0x00192Fb10dF37c9FB26829eb2CC623cd1BF599E8'
      fstCollection = { ...fstCollection, urn: `urn:decentraland:goerli:collections-v2:${newCollectionAddress}` } as Collection
      getChainIdByNetworkMock.mockReturnValueOnce(ChainId.ETHEREUM_GOERLI as any).mockReturnValueOnce(ChainId.ETHEREUM_GOERLI as any)
      result = itemReducer(state, saveCollectionSuccess(fstCollection))
    })

    it("should update the collection items's URN according to the collection URN and not update the other items", () => {
      expect(result).toEqual({
        ...state,
        data: {
          ...state.data,
          [fstItem.id]: {
            ...fstItem,
            urn: `urn:decentraland:goerli:collections-v2:${newCollectionAddress}:fst-token-id`
          },
          [sndItem.id]: {
            ...sndItem,
            urn: `urn:decentraland:goerli:collections-v2:${newCollectionAddress}:snd-token-id`
          }
        }
      })
    })
  })

  describe('and the collection is a decentraland collection', () => {
    let newThirdPartyCollectionId: string

    beforeEach(() => {
      newThirdPartyCollectionId = 'another-tp-collection-id'
      sndCollection = {
        ...sndCollection,
        urn: `urn:decentraland:matic:collections-thirdparty:tp-id:${newThirdPartyCollectionId}`
      } as Collection
      getChainIdByNetworkMock.mockReturnValueOnce(ChainId.MATIC_MAINNET as any)
      result = itemReducer(state, saveCollectionSuccess(sndCollection))
    })

    it("should update the collection items's URN according to the collection URN and not update the other items", () => {
      expect(result).toEqual({
        ...state,
        data: {
          ...state.data,
          [thirdItem.id]: {
            ...thirdItem,
            urn: `urn:decentraland:matic:collections-thirdparty:tp-id:${newThirdPartyCollectionId}:tp-token-id`
          }
        }
      })
    })
  })
})

describe('when an action of type DOWNLOAD_ITEM_REQUEST is called', () => {
  const itemId = 'anItem'
  it('should add a downloadItemRequest to the loading array', () => {
    expect(itemReducer(INITIAL_STATE, downloadItemRequest(itemId))).toStrictEqual({
      ...INITIAL_STATE,
      loading: [downloadItemRequest(itemId)]
    })
  })
})

describe('when an action of type DOWNLOAD_ITEM_SUCCESS is called', () => {
  const itemId = 'anItem'

  it('should remove a downloadItemRequest from the loading array and null the error', () => {
    expect(
      itemReducer(
        {
          ...INITIAL_STATE,
          loading: [downloadItemRequest(itemId)],
          error
        },
        downloadItemSuccess(itemId)
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      loading: [],
      error: null
    })
  })
})

describe('when an action of type DOWNLOAD_ITEM_FAILURE is called', () => {
  const itemId = 'anItem'
  it('should remove a downloadItemRequest from the loading array and set the error', () => {
    expect(
      itemReducer(
        {
          ...INITIAL_STATE,
          loading: [downloadItemRequest(itemId)]
        },
        downloadItemFailure(itemId, error)
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      loading: [],
      error
    })
  })
})

describe('when reducing the successful save multiple items action', () => {
  it('should return a state with the saved items', () => {
    expect(itemReducer(state, saveMultipleItemsSuccess(items, fileNames, []))).toEqual({
      ...INITIAL_STATE,
      data: { ...state.data, ...itemsMap }
    })
  })
})

describe('when reducing the save cancelling save multiple items action', () => {
  it('should return a state with the saved items added', () => {
    expect(itemReducer(state, saveMultipleItemsCancelled(items, [], [], fileNames))).toEqual({
      ...INITIAL_STATE,
      data: {
        ...state.data,
        ...itemsMap
      }
    })
  })
})

describe('when reducing the clearing save multiple items action', () => {
  beforeEach(() => {
    state = {
      ...state,
      error
    }
  })

  it('should return a state with the error cleared', () => {
    expect(itemReducer(state, clearSaveMultipleItems())).toEqual({
      ...state,
      error: null
    })
  })
})

describe('when reducing an action of a successful rescue items', () => {
  let collection: Collection
  let items: Item[]
  let contentHashes: string[]

  beforeEach(() => {
    collection = { id: 'some-id' } as Collection
    items = [{ id: 'some-id' } as Item]
    contentHashes = ['some-hash']

    state = {
      ...state,
      loading: [rescueItemsRequest(collection, items, contentHashes)],
      error
    }
  })
  it('should remove the rescue items request action from the loading array and null the error', () => {
    expect(itemReducer(state, rescueItemsSuccess(collection, items, contentHashes, ChainId.MATIC_MUMBAI, ['hashes']))).toEqual({
      ...state,
      loading: [],
      error: null
    })
  })
})

describe('when reducing an action of a successful chunk of rescued items', () => {
  let collection: Collection
  let items: Item[]
  let contentHashes: string[]

  beforeEach(() => {
    collection = { id: 'some-id' } as Collection
    items = [{ id: 'some-id' } as Item]
    contentHashes = ['some-hash']

    state = {
      ...state,
      data: {
        anItemId: {
          id: 'anItemId'
        } as Item
      }
    }
  })

  it('should add the items to the state', () => {
    expect(itemReducer(state, rescueItemsChunkSuccess(collection, items, contentHashes, ChainId.MATIC_MUMBAI, 'hash'))).toEqual({
      ...state,
      data: {
        ...state.data,
        [items[0].id]: items[0]
      }
    })
  })
})

describe('when reducing an action of a successful fetch of collection items', () => {
  let collection: Collection
  let items: Item[]
  let paginationData: PaginatedResource<Item>

  beforeEach(() => {
    collection = { id: 'some-id' } as Collection
    items = [{ id: 'some-id' } as Item]
    paginationData = {
      limit: 1,
      page: 1,
      pages: 1,
      total: 1,
      results: items
    }

    state = {
      ...state,
      data: {
        anItemId: {
          id: 'anItemId'
        } as Item
      },
      pagination: {
        anAddress: {
          ids: ['anItemId'],
          total: 1,
          currentPage: 1,
          limit: 1,
          totalPages: 1
        }
      }
    }
  })

  describe('and fetching only one page', () => {
    it('should add the items to the state and update the pagination data', () => {
      expect(itemReducer(state, fetchCollectionItemsSuccess(collection.id, items, paginationData))).toEqual({
        ...state,
        data: {
          ...state.data,
          ...toItemObject(items)
        },
        pagination: {
          ...state.pagination,
          [collection.id]: {
            ids: items.map(item => item.id),
            total: paginationData.total,
            currentPage: paginationData.page,
            limit: paginationData.limit,
            totalPages: paginationData.pages
          }
        }
      })
    })
  })
  describe('and fetching several pages at the same time', () => {
    it('should add the items to the state with the new items', () => {
      expect(itemReducer(state, fetchCollectionItemsSuccess(collection.id, items, undefined))).toEqual({
        ...state,
        data: {
          ...state.data,
          ...toItemObject(items)
        }
      })
    })
  })
})

describe('when an action of type FETCH_ORPHAN_ITEM_REQUEST is called', () => {
  const address = '0x0'
  it('should add a fetchOrphanItemRequest to the loading array', () => {
    expect(itemReducer(INITIAL_STATE, fetchOrphanItemRequest(address))).toStrictEqual({
      ...INITIAL_STATE,
      loading: [fetchOrphanItemRequest(address)]
    })
  })
})

describe('when an action of type FETCH_ORPHAN_ITEM_SUCCESS is called', () => {
  const address = '0x0'
  describe('and there are orphan items', () => {
    it('should remove a fetchOrphanItemRequest from the loading array, set hasUserOrphanItems true and null the error', () => {
      expect(
        itemReducer(
          {
            ...INITIAL_STATE,
            loading: [fetchOrphanItemRequest(address)],
            error
          },
          fetchOrphanItemSuccess(true)
        )
      ).toStrictEqual({
        ...INITIAL_STATE,
        loading: [],
        hasUserOrphanItems: true,
        error: null
      })
    })
  })

  describe('and there are not orphan items', () => {
    it('should remove a fetchOrphanItemRequest from the loading array, set hasUserOrphanItems false and null the error', () => {
      expect(
        itemReducer(
          {
            ...INITIAL_STATE,
            loading: [fetchOrphanItemRequest(address)],
            error
          },
          fetchOrphanItemSuccess(false)
        )
      ).toStrictEqual({
        ...INITIAL_STATE,
        loading: [],
        hasUserOrphanItems: false,
        error: null
      })
    })
  })
})

describe('when an action of type FETCH_ORPHAN_ITEM_FAILURE is called', () => {
  const address = '0x0'
  it('should remove a fetchOrphanItemRequest from the loading array and set the error', () => {
    expect(
      itemReducer(
        {
          ...INITIAL_STATE,
          loading: [fetchOrphanItemRequest(address)]
        },
        fetchOrphanItemFailure(error)
      )
    ).toStrictEqual({
      ...INITIAL_STATE,
      loading: [],
      error
    })
  })
})

describe.each([
  ['pushing changes and publishing third party items', finishPublishAndPushChangesThirdPartyItemsSuccess],
  ['pushing changes third party items', pushChangesThirdPartyItemsSuccess],
  ['publishing third party items', publishThirdPartyItemsSuccess]
])('when reducing the successful action of %s', (_, fn) => {
  let action:
    | PublishThirdPartyItemsSuccessAction
    | FinishPublishAndPushChangesThirdPartyItemsSuccessAction
    | PushChangesThirdPartyItemsSuccessAction

  beforeEach(() => {
    const curations: ItemCuration[] = items.map(item => ({
      itemId: item.id,
      contentHash: 'aHash',
      id: 'aCurationId',
      updatedAt: 0,
      createdAt: 0,
      status: CurationStatus.PENDING
    }))

    switch (fn) {
      case pushChangesThirdPartyItemsSuccess:
        action = pushChangesThirdPartyItemsSuccess('aCollectionId', curations)
        break
      case publishThirdPartyItemsSuccess:
        action = publishThirdPartyItemsSuccess('aThirdPartyId', 'aCollectionId', items, curations)
        break
      case finishPublishAndPushChangesThirdPartyItemsSuccess:
        action = finishPublishAndPushChangesThirdPartyItemsSuccess({} as ThirdParty, 'aCollectionId', curations)
        break
    }
  })

  describe('and the items are not in the state', () => {
    beforeEach(() => {
      state = {
        ...INITIAL_STATE
      }
    })

    it('should return the state as is', () => {
      expect(itemReducer(state, action)).toEqual(state)
    })
  })

  describe('and the items are in the state', () => {
    beforeEach(() => {
      state = {
        ...INITIAL_STATE,
        data: items.reduce((acc, item) => ({ ...acc, [item.id]: { ...item, isPublished: false, isMappingComplete: !!item.mappings } }), {})
      }
    })

    it("should set the items as published and set the isMappingComplete property in accordance to the item's mapping", () => {
      expect(itemReducer(state, action)).toEqual({
        ...state,
        data: items.reduce(
          (acc, item) => ({
            ...acc,
            [item.id]: { ...item, isPublished: true, isMappingComplete: !!item.mappings }
          }),
          {}
        )
      })
    })
  })
})
