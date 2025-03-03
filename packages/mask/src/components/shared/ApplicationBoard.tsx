import { useCallback, useState } from 'react'
import classNames from 'classnames'
import { Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { ChainId, useChainId, useAccount, useWallet } from '@masknet/web3-shared-evm'
import { useRemoteControlledDialog } from '@masknet/shared'
import { MaskMessages } from '../../utils/messages'
import { useControlledDialog } from '../../utils/hooks/useControlledDialog'
import { RedPacketPluginID } from '../../plugins/RedPacket/constants'
import { ITO_PluginID } from '../../plugins/ITO/constants'
import { PluginTransakMessages } from '../../plugins/Transak/messages'
import { PluginPetMessages } from '../../plugins/Pets/messages'
import { ClaimAllDialog } from '../../plugins/ITO/SNSAdaptor/ClaimAllDialog'
import { EntrySecondLevelDialog } from './EntrySecondLevelDialog'
import { NetworkTab } from './NetworkTab'
import { TraderDialog } from '../../plugins/Trader/SNSAdaptor/trader/TraderDialog'
import { NetworkPluginID, PluginId, usePluginIDContext } from '@masknet/plugin-infra'
import { FindTrumanDialog } from '../../plugins/FindTruman/SNSAdaptor/FindTrumanDialog'

const useStyles = makeStyles()((theme) => ({
    abstractTabWrapper: {
        position: 'sticky',
        top: 0,
        width: '100%',
        zIndex: 2,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(2),
        backgroundColor: theme.palette.background.paper,
    },
    tab: {
        height: 36,
        minHeight: 36,
        fontWeight: 300,
    },
    tabs: {
        width: 552,
        height: 36,
        minHeight: 36,
        margin: '0 auto',
        borderRadius: 4,
        '& .Mui-selected': {
            color: theme.palette.primary.contrastText,
            backgroundColor: theme.palette.primary.main,
        },
    },
    tabPanel: {
        marginTop: theme.spacing(3),
    },
    indicator: {
        display: 'none',
    },
    applicationBox: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        borderRadius: '8px',
        cursor: 'pointer',
        height: 100,
        '&:hover': {
            transform: 'scale(1.05) translateY(-4px)',
            boxShadow: theme.palette.mode === 'light' ? '0px 10px 16px rgba(0, 0, 0, 0.1)' : 'none',
        },
    },
    applicationWrapper: {
        marginTop: 4,
        display: 'grid',
        gridTemplateColumns: '123px 123px 123px 123px',
        gridTemplateRows: '100px',
        rowGap: 12,
        justifyContent: 'space-between',
        height: 324,
    },
    applicationImg: {
        width: 36,
        height: 36,
        marginBottom: 10,
    },
    disabled: {
        pointerEvents: 'none',
        opacity: 0.5,
    },
    title: {
        fontSize: 15,
    },
}))

const SUPPORTED_CHAIN_ID_LIST = [
    ChainId.Mainnet,
    ChainId.BSC,
    ChainId.Matic,
    ChainId.Arbitrum,
    ChainId.xDai,
    ChainId.Celo,
    ChainId.Fantom,
    ChainId.Aurora,
    ChainId.Avalanche,
]

export interface MaskAppEntry {
    title: string
    img: string
    onClick: any
    supportedChains?: ChainId[]
    hidden: boolean
    walletRequired: boolean
}

interface MaskApplicationBoxProps {
    secondEntries?: MaskAppEntry[]
    secondEntryChainTabs?: ChainId[]
}

export function ApplicationBoard({ secondEntries, secondEntryChainTabs }: MaskApplicationBoxProps) {
    const { classes } = useStyles()
    const currentChainId = useChainId()
    const account = useAccount()
    const selectedWallet = useWallet()
    const currentPluginId = usePluginIDContext()
    const isNotEvm = currentPluginId !== NetworkPluginID.PLUGIN_EVM

    // #region Encrypted message
    const openEncryptedMessage = useCallback(
        (id?: string) =>
            MaskMessages.events.requestComposition.sendToLocal({
                reason: 'timeline',
                open: true,
                options: {
                    startupPlugin: id,
                },
            }),
        [],
    )
    // #endregion

    // #region Claim All ITO
    const {
        open: isClaimAllDialogOpen,
        onOpen: onClaimAllDialogOpen,
        onClose: onClaimAllDialogClose,
    } = useControlledDialog()
    // #endregion

    // #region Swap
    const { open: isSwapDialogOpen, onOpen: onSwapDialogOpen, onClose: onSwapDialogClose } = useControlledDialog()
    // #endregion

    // #region Fiat on/off ramp
    const { setDialog: setBuyDialog } = useRemoteControlledDialog(PluginTransakMessages.buyTokenDialogUpdated)
    // #endregion

    // #region pet friends
    const { setDialog: setPetDialog } = useRemoteControlledDialog(PluginPetMessages.events.essayDialogUpdated)
    // #endregion

    // #region second level entry dialog
    const {
        open: isSecondLevelEntryDialogOpen,
        onOpen: onSecondLevelEntryDialogOpen,
        onClose: onSecondLevelEntryDialogClose,
    } = useControlledDialog()

    const [secondLevelEntryDialogTitle, setSecondLevelEntryDialogTitle] = useState('')
    const [secondLevelEntryChains, setSecondLevelEntryChains] = useState<ChainId[] | undefined>([])
    const [secondLevelEntries, setSecondLevelEntries] = useState<MaskAppEntry[]>([])

    const [chainId, setChainId] = useState(
        secondEntryChainTabs?.includes(currentChainId) ? currentChainId : ChainId.Mainnet,
    )

    const openSecondEntryDir = useCallback(
        (title: string, maskAppEntries: MaskAppEntry[], chains: ChainId[] | undefined) => {
            setSecondLevelEntryDialogTitle(title)
            setSecondLevelEntries(maskAppEntries)
            setSecondLevelEntryChains(chains)
            onSecondLevelEntryDialogOpen()
        },
        [],
    )
    // #endregion

    // #region FindTruman
    const {
        open: isFindTrumanDialogOpen,
        onOpen: onFindTrumanDialogOpen,
        onClose: onFindTrumanDialogClose,
    } = useControlledDialog()
    // #endregion

    function createEntry(
        title: string,
        img: string,
        onClick: any,
        supportedChains?: ChainId[],
        hidden = false,
        walletRequired = true,
    ) {
        return {
            title,
            img,
            onClick,
            supportedChains,
            hidden,
            walletRequired,
        }
    }

    const firstLevelEntries: MaskAppEntry[] = [
        createEntry(
            'Lucky Drop',
            new URL('./assets/lucky_drop.png', import.meta.url).toString(),
            () => openEncryptedMessage(RedPacketPluginID),
            undefined,
            isNotEvm,
        ),
        createEntry(
            'File Service',
            new URL('./assets/files.png', import.meta.url).toString(),
            () => openEncryptedMessage(PluginId.FileService),
            undefined,
            false,
            false,
        ),
        createEntry(
            'ITO',
            new URL('./assets/token.png', import.meta.url).toString(),
            () => openEncryptedMessage(ITO_PluginID),
            undefined,
            isNotEvm,
        ),
        createEntry(
            'Claim',
            new URL('./assets/gift.png', import.meta.url).toString(),
            onClaimAllDialogOpen,
            undefined,
            isNotEvm,
        ),
        createEntry(
            'Mask Bridge',
            new URL('./assets/bridge.png', import.meta.url).toString(),
            () => window.open('https://bridge.mask.io/#/', '_blank', 'noopener noreferrer'),
            undefined,
            isNotEvm,
            false,
        ),
        createEntry(
            'MaskBox',
            new URL('./assets/mask_box.png', import.meta.url).toString(),
            () => window.open('https://box.mask.io/#/', '_blank', 'noopener noreferrer'),
            undefined,
            isNotEvm,
            false,
        ),
        createEntry(
            'Swap',
            new URL('./assets/swap.png', import.meta.url).toString(),
            onSwapDialogOpen,
            undefined,
            isNotEvm,
        ),
        createEntry(
            'Fiat On-Ramp',
            new URL('./assets/fiat_ramp.png', import.meta.url).toString(),
            () => setBuyDialog({ open: true, address: account }),
            undefined,
            false,
            false,
        ),
        createEntry(
            'NFTs',
            new URL('./assets/nft.png', import.meta.url).toString(),
            () =>
                openSecondEntryDir(
                    'NFTs',
                    [
                        createEntry(
                            'MaskBox',
                            new URL('./assets/mask_box.png', import.meta.url).toString(),
                            () => window.open('https://box.mask.io/#/', '_blank', 'noopener noreferrer'),
                            undefined,
                            false,
                            false,
                        ),
                        createEntry(
                            'Valuables',
                            new URL('./assets/valuables.png', import.meta.url).toString(),
                            () => {},
                            undefined,
                            true,
                        ),
                        createEntry(
                            'Non-F Friends',
                            new URL('./assets/mintTeam.png', import.meta.url).toString(),
                            () => setPetDialog({ open: true }),
                            [ChainId.Mainnet],
                            currentChainId !== ChainId.Mainnet,
                            true,
                        ),
                    ],
                    undefined,
                ),
            undefined,
            isNotEvm,
        ),
        createEntry(
            'Investment',
            new URL('./assets/investment.png', import.meta.url).toString(),
            () =>
                openSecondEntryDir(
                    'Investment',
                    [
                        createEntry('Zerion', new URL('./assets/zerion.png', import.meta.url).toString(), () => {}, [
                            ChainId.Mainnet,
                        ]),
                        createEntry('dHEDGE', new URL('./assets/dHEDGE.png', import.meta.url).toString(), () => {}),
                    ],
                    SUPPORTED_CHAIN_ID_LIST,
                ),
            undefined,
            true,
        ),
        createEntry('Saving', new URL('./assets/saving.png', import.meta.url).toString(), undefined, undefined, true),
        createEntry(
            'Alternative',
            new URL('./assets/more.png', import.meta.url).toString(),
            () =>
                openSecondEntryDir(
                    'Alternative',
                    [
                        createEntry(
                            'PoolTogether',
                            new URL('./assets/pool_together.png', import.meta.url).toString(),
                            () => {},
                        ),
                    ],
                    SUPPORTED_CHAIN_ID_LIST,
                ),
            undefined,
            true,
        ),
        createEntry(
            'FindTruman',
            new URL('./assets/findtruman.png', import.meta.url).toString(),
            onFindTrumanDialogOpen,
            [ChainId.Mainnet],
            false,
            true,
        ),
    ]

    return (
        <>
            {secondEntryChainTabs?.length ? (
                <div className={classes.abstractTabWrapper}>
                    <NetworkTab
                        chainId={chainId}
                        setChainId={setChainId}
                        classes={classes}
                        chains={secondEntryChainTabs}
                    />
                </div>
            ) : null}
            <section className={classes.applicationWrapper}>
                {(secondEntries ?? firstLevelEntries).map(
                    ({ title, img, onClick, supportedChains, hidden, walletRequired }, i) =>
                        (!supportedChains || supportedChains?.includes(chainId)) && !hidden ? (
                            <div
                                className={classNames(
                                    classes.applicationBox,
                                    walletRequired && !selectedWallet ? classes.disabled : '',
                                )}
                                onClick={onClick}
                                key={i}>
                                <img src={img} className={classes.applicationImg} />
                                <Typography className={classes.title} color="textPrimary">
                                    {title}
                                </Typography>
                            </div>
                        ) : null,
                )}
            </section>
            {isClaimAllDialogOpen ? (
                <ClaimAllDialog open={isClaimAllDialogOpen} onClose={onClaimAllDialogClose} />
            ) : null}
            {isSwapDialogOpen ? <TraderDialog open={isSwapDialogOpen} onClose={onSwapDialogClose} /> : null}
            {isSecondLevelEntryDialogOpen ? (
                <EntrySecondLevelDialog
                    title={secondLevelEntryDialogTitle}
                    open={isSecondLevelEntryDialogOpen}
                    entries={secondLevelEntries}
                    chains={secondLevelEntryChains}
                    closeDialog={onSecondLevelEntryDialogClose}
                />
            ) : null}
            {isFindTrumanDialogOpen ? (
                <FindTrumanDialog open={isFindTrumanDialogOpen} onClose={onFindTrumanDialogClose} />
            ) : null}
        </>
    )
}
