import { AuthorizationStepStatus } from 'decentraland-ui'
import { Collection } from 'modules/collection/types'
import { RootState } from 'modules/common/types'
import {
  DEPLOY_BATCHED_THIRD_PARTY_ITEMS_REQUEST,
  DISABLE_THIRD_PARTY_SUCCESS,
  disableThirdPartyRequest,
  fetchThirdPartiesRequest,
  fetchThirdPartyRequest,
  FINISH_PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST,
  PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS,
  publishAndPushChangesThirdPartyItemsRequest,
  setThirdPartyKindRequest
} from './actions'
import {
  isThirdPartyManager,
  getWalletThirdParties,
  getCollectionThirdParty,
  getItemThirdParty,
  isDeployingBatchedThirdPartyItems,
  isLoadingThirdParties,
  getThirdParty,
  isDisablingThirdParty,
  hasPendingDisableThirdPartyTransaction,
  isLoadingThirdParty,
  getThirdPartyPublishStatus,
  isSettingThirdPartyType
} from './selectors'
import { ThirdParty } from './types'
import { INITIAL_STATE } from './reducer'

describe('Third Party selectors', () => {
  let address: string
  let baseState: RootState
  let thirdParty1: ThirdParty
  let thirdParty2: ThirdParty
  let thirdParty3: ThirdParty

  beforeEach(() => {
    address = '0xdeabeef'
    thirdParty1 = {
      id: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty1',
      name: 'a third party',
      root: '',
      description: 'some desc',
      maxItems: '0',
      totalItems: '0',
      contracts: [],
      managers: [address, '0xa'],
      isApproved: true,
      isProgrammatic: false,
      published: false
    }
    thirdParty2 = {
      id: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2',
      name: 'a third party',
      root: '',
      description: 'some desc',
      maxItems: '0',
      totalItems: '0',
      contracts: [],
      managers: [address, '0xb'],
      isApproved: true,
      isProgrammatic: false,
      published: false
    }
    thirdParty3 = {
      id: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty3',
      name: 'a third party',
      root: '',
      description: 'some desc',
      maxItems: '0',
      totalItems: '0',
      contracts: [],
      managers: ['0xc'],
      isApproved: true,
      isProgrammatic: false,
      published: false
    }
    baseState = {
      wallet: {
        data: {
          address
        }
      },
      thirdParty: {
        ...INITIAL_STATE
      },
      transaction: {
        data: []
      }
    } as any
  })

  describe('when checking if the current wallet is a manager', () => {
    describe('when the address belongs to a manager list of any third party', () => {
      let state: RootState

      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            data: {
              anId: { id: 'anId', name: 'a third party', description: 'some desc', managers: [address] }
            }
          }
        } as any
      })

      it('should return true', () => {
        expect(isThirdPartyManager(state)).toBe(true)
      })
    })

    describe('when the address does not belong to a manager list of any third party', () => {
      let state: RootState

      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            data: {
              anId: { id: 'anId', name: 'a third party', description: 'some desc', managers: ['0x123123123'] }
            }
          }
        } as any
      })

      it('should return false', () => {
        expect(isThirdPartyManager(state)).toBe(false)
      })
    })
  })

  describe('when getting the wallet third parties', () => {
    let state: RootState
    let thirdParties: ThirdParty[]

    beforeEach(() => {
      thirdParties = [thirdParty1, thirdParty2]

      state = {
        ...baseState,
        thirdParty: {
          data: {
            [thirdParty1.id]: thirdParty1,
            [thirdParty2.id]: thirdParty2,
            [thirdParty3.id]: thirdParty3
          }
        }
      } as any
    })

    it('should return all third parties where the address belongs to the manager list', () => {
      expect(getWalletThirdParties(state)).toEqual(thirdParties)
    })
  })

  describe('when getting the third party of a collection', () => {
    let state: RootState
    let collection: Collection

    beforeEach(() => {
      state = {
        ...baseState,
        thirdParty: {
          ...baseState.thirdParty,
          data: {
            [thirdParty1.id]: thirdParty1,
            [thirdParty2.id]: thirdParty2,
            [thirdParty3.id]: thirdParty3
          }
        }
      }
    })

    describe("and the collection doesn't have a valid third party URN", () => {
      beforeEach(() => {
        collection = {
          urn: 'urn:decentraland:goerli:collections-v2:0xbd0847050e3b92ed0e862b8a919c5dce7ce01311'
        } as Collection
      })

      it('should throw with an error signaling that the URN is not valid', () => {
        expect(() => getCollectionThirdParty(state, collection)).toThrowError('URN is not a third party URN')
      })
    })

    describe('and the collection has a valid URN', () => {
      beforeEach(() => {
        collection = {
          urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:one-third-party-collection'
        } as Collection
      })

      it('should return the third party that matches the given id', () => {
        expect(getCollectionThirdParty(state, collection)).toEqual(thirdParty2)
      })
    })
  })

  describe('when getting the third party of an item', () => {
    let state: RootState
    let item: any

    beforeEach(() => {
      state = {
        ...baseState,
        thirdParty: {
          ...baseState.thirdParty,
          data: {
            [thirdParty1.id]: thirdParty1,
            [thirdParty2.id]: thirdParty2,
            [thirdParty3.id]: thirdParty3
          }
        }
      }
    })

    describe("and the item doesn't have a valid third party URN", () => {
      beforeEach(() => {
        item = {
          urn: 'urn:decentraland:goerli:collections-v2:0xbd0847050e3b92ed0e862b8a919c5dce7ce01311'
        } as any
      })

      it('should throw with an error signaling that the URN is not valid', () => {
        expect(() => getItemThirdParty(state, item)).toThrowError('URN is not a third party URN')
      })
    })

    describe("and the item doesn't have an URN", () => {
      beforeEach(() => {
        item = {
          urn: null
        } as any
      })

      it('should return a nulled third party', () => {
        expect(getItemThirdParty(state, item)).toEqual(null)
      })
    })

    describe('and the item has a valid URN', () => {
      beforeEach(() => {
        item = {
          urn: 'urn:decentraland:mumbai:collections-thirdparty:thirdparty2:one-third-party-collection'
        } as any
      })

      it('should return the third party that matches the given id', () => {
        expect(getItemThirdParty(state, item)).toEqual(thirdParty2)
      })
    })
  })

  describe('when getting if a batched set of third party items is being deployed', () => {
    let state: RootState

    describe('when the batched items are being deployed', () => {
      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            ...baseState.thirdParty,
            loading: [{ type: DEPLOY_BATCHED_THIRD_PARTY_ITEMS_REQUEST }]
          }
        }
      })

      it('should return true', () => {
        expect(isDeployingBatchedThirdPartyItems(state)).toBe(true)
      })
    })

    describe('when the batched items are not being deployed', () => {
      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            ...baseState.thirdParty,
            loading: []
          }
        }
      })

      it('should return false', () => {
        expect(isDeployingBatchedThirdPartyItems(state)).toBe(false)
      })
    })
  })

  describe('when getting if the third parties are being loaded', () => {
    let state: RootState

    describe('and the third parties are being loaded', () => {
      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            ...baseState.thirdParty,
            loading: [fetchThirdPartiesRequest()]
          }
        }
      })

      it('should return true', () => {
        expect(isLoadingThirdParties(state)).toBe(true)
      })
    })

    describe('and the third parties are not being loaded', () => {
      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            ...baseState.thirdParty,
            loading: []
          }
        }
      })

      it('should return false', () => {
        expect(isLoadingThirdParties(state)).toBe(false)
      })
    })
  })

  describe('when getting if a third party is being loaded', () => {
    let state: RootState
    let thirdPartyId: string
    beforeEach(() => {
      thirdPartyId = 'aThirdPartyId'
    })

    describe('and the third party is being loaded', () => {
      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            ...baseState.thirdParty,
            loading: [fetchThirdPartyRequest(thirdPartyId)]
          }
        }
      })

      it('should return true', () => {
        expect(isLoadingThirdParty(state, thirdPartyId)).toBe(true)
      })
    })

    describe('and another third party is being loaded', () => {
      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            ...baseState.thirdParty,
            loading: [fetchThirdPartyRequest('anotherId')]
          }
        }
      })

      it('should return false', () => {
        expect(isLoadingThirdParty(state, thirdPartyId)).toBe(false)
      })
    })

    describe('and no third party is not being loaded', () => {
      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            ...baseState.thirdParty,
            loading: []
          }
        }
      })

      it('should return false', () => {
        expect(isLoadingThirdParty(state, thirdPartyId)).toBe(false)
      })
    })
  })

  describe('when getting a third party', () => {
    describe('and the third party exists', () => {
      let state: RootState

      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            data: {
              [thirdParty1.id]: thirdParty1
            }
          }
        } as any
      })

      it('should return the third party', () => {
        expect(getThirdParty(state, thirdParty1.id)).toBe(thirdParty1)
      })
    })

    describe('and the third party does not exist', () => {
      let state: RootState

      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            data: {}
          }
        } as any
      })

      it('should return null', () => {
        expect(getThirdParty(state, thirdParty1.id)).toBe(null)
      })
    })
  })

  describe('when checking if a third party is being disabled', () => {
    let state: RootState

    describe('and the disable third party request is being processed', () => {
      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            ...baseState.thirdParty,
            loading: [disableThirdPartyRequest(thirdParty1.id)]
          }
        }
      })

      it('should return true', () => {
        expect(isDisablingThirdParty(state)).toBe(true)
      })
    })

    describe('and the disable third party request is not being processed', () => {
      beforeEach(() => {
        state = {
          ...baseState,
          thirdParty: {
            ...baseState.thirdParty,
            loading: []
          }
        }
      })

      it('should return false', () => {
        expect(isDisablingThirdParty(state)).toBe(false)
      })
    })
  })

  describe('when checking if a disable third party transaction is pending', () => {
    beforeEach(() => {
      baseState = {
        ...baseState,
        transaction: {
          ...baseState.transaction,
          data: [
            {
              events: [],
              hash: '0x123',
              nonce: 1,
              actionType: DISABLE_THIRD_PARTY_SUCCESS,
              payload: { thirdPartyId: thirdParty1.id },
              status: null,
              from: address,
              replacedBy: null,
              timestamp: 0,
              url: 'url',
              isCrossChain: false,
              chainId: 1
            }
          ]
        }
      } as RootState
    })

    describe('and the transaction is pending', () => {
      beforeEach(() => {
        baseState = {
          ...baseState,
          transaction: {
            ...baseState.transaction,
            data: [
              {
                ...baseState.transaction.data[0],
                status: null
              }
            ]
          }
        } as RootState
      })

      it('should return true', () => {
        expect(hasPendingDisableThirdPartyTransaction(baseState, thirdParty1.id)).toBe(true)
      })
    })

    describe('and the transaction is not pending', () => {
      beforeEach(() => {
        baseState = {
          ...baseState,
          transaction: {
            ...baseState.transaction,
            data: [
              {
                ...baseState.transaction.data[0],
                status: 'confirmed'
              }
            ]
          }
        } as RootState
      })

      it('should return false', () => {
        expect(hasPendingDisableThirdPartyTransaction(baseState, thirdParty1.id)).toBe(false)
      })
    })
  })

  describe('when getting the third party publish status', () => {
    describe("and there's no user logged in", () => {
      beforeEach(() => {
        baseState = {
          ...baseState,
          wallet: {
            ...baseState.wallet,
            data: null
          }
        }
      })

      it('should return the error authorization step', () => {
        expect(getThirdPartyPublishStatus(baseState)).toEqual(AuthorizationStepStatus.ERROR)
      })
    })
  })

  describe('and the user is logged in', () => {
    describe('and the publish and push changes sagas is being processed', () => {
      beforeEach(() => {
        baseState = {
          ...baseState,
          thirdParty: {
            ...baseState.thirdParty,
            loading: [publishAndPushChangesThirdPartyItemsRequest(thirdParty1, [], [])]
          }
        }
      })

      it('should return the waiting authorization step', () => {
        expect(getThirdPartyPublishStatus(baseState)).toEqual(AuthorizationStepStatus.WAITING)
      })
    })

    describe('and the transaction is being processed', () => {
      beforeEach(() => {
        baseState = {
          ...baseState,
          transaction: {
            ...baseState.transaction,
            data: [
              {
                events: [],
                hash: '0x123',
                nonce: 1,
                actionType: PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_SUCCESS,
                payload: { thirdPartyId: thirdParty1.id },
                status: null,
                from: address,
                replacedBy: null,
                timestamp: 0,
                url: 'url',
                isCrossChain: false,
                chainId: 1
              }
            ]
          }
        } as RootState
      })

      it('should return the waiting authorization step', () => {
        expect(getThirdPartyPublishStatus(baseState)).toEqual(AuthorizationStepStatus.PROCESSING)
      })
    })

    describe('and the user is finishing the publish and pushing of third party items', () => {
      beforeEach(() => {
        baseState = {
          ...baseState,
          thirdParty: {
            ...baseState.thirdParty,
            loading: [{ type: FINISH_PUBLISH_AND_PUSH_CHANGES_THIRD_PARTY_ITEMS_REQUEST }],
            error: null
          }
        }
      })

      it('should return the processing authorization step', () => {
        expect(getThirdPartyPublishStatus(baseState)).toEqual(AuthorizationStepStatus.PROCESSING)
      })
    })

    describe('and there is an error', () => {
      beforeEach(() => {
        baseState = {
          ...baseState,
          thirdParty: {
            ...baseState.thirdParty,
            error: 'An error'
          }
        }
      })

      it('should return the error authorization step', () => {
        expect(getThirdPartyPublishStatus(baseState)).toEqual(AuthorizationStepStatus.ERROR)
      })
    })

    describe('and nothing is happening', () => {
      beforeEach(() => {
        baseState = {
          ...baseState,
          thirdParty: {
            ...baseState.thirdParty,
            loading: [],
            error: null
          }
        }
      })

      it('should return the pending authorization step', () => {
        expect(getThirdPartyPublishStatus(baseState)).toEqual(AuthorizationStepStatus.PENDING)
      })
    })
  })

  describe('when setting the third party type', () => {
    describe('and the third party type is being set', () => {
      beforeEach(() => {
        baseState = {
          ...baseState,
          thirdParty: {
            ...baseState.thirdParty,
            loading: [setThirdPartyKindRequest(thirdParty1.id, true)]
          }
        }
      })

      it('should return true', () => {
        expect(isSettingThirdPartyType(baseState)).toBe
      })

      describe('and the third party type is not being set', () => {
        beforeEach(() => {
          baseState = {
            ...baseState,
            thirdParty: {
              ...baseState.thirdParty,
              loading: []
            }
          }
        })

        it('should return false', () => {
          expect(isSettingThirdPartyType(baseState)).toBe(false)
        })
      })
    })
  })
})
