export default ({ direction, reverse, justifyContents, alignItems, flexWrap, minHeight }) => ({
    WWCONTAINER_EDIT: {
        title: {
            en: 'Edit Container',
            fr: 'Editer le container'
        },
        type: 'wwPopupEditWwObject',
        buttons: null,
        storyData: {
            list: {
                SELECT_LAYOUT: {
                    separator: {
                        en: "Container's layout",
                        fr: 'Disposition du container'
                    },
                    title: {
                        en: "Container's layout",
                        fr: 'Disposition du container'
                    },
                    desc: {
                        en: 'Set layout to column or row.',
                        fr: 'Changer la disposition du container en colonne ou en ligne.'
                    },
                    icon: 'fas fa-columns',
                    shortcut: 'l',
                    next: 'WWCONTAINER_LAYOUT'
                }
            }
        }
    },
    WWCONTAINER_LAYOUT: {
        title: {
            en: "Container's layout",
            fr: 'Disposition du container'
        },
        type: 'wwPopupForm',
        buttons: {
            OK: {
                text: {
                    en: 'Ok',
                    fr: 'Valider'
                },
                next: false
            }
        },
        storyData: {
            fields: [
                {
                    label: {
                        en: "Container's layout",
                        fr: 'Disposition du container'
                    },
                    desc: {
                        en: 'Set layout to column or row.',
                        fr: 'Changer la disposition du container en colonne ou en ligne.'
                    },
                    type: 'select',
                    key: 'direction',
                    value: direction,
                    options: {
                        wwObject: {},
                        values: [
                            {
                                value: 'column',
                                text: {
                                    en: 'Column',
                                    fr: 'Colonne'
                                }
                            },
                            {
                                value: 'row',
                                default: true,
                                text: {
                                    en: 'Row',
                                    fr: 'Ligne'
                                }
                            }
                        ]
                    }
                },
                {
                    label: {
                        en: "Reverse elements' order",
                        fr: "Inverser l'ordre des élements"
                    },
                    desc: {
                        en: 'Show element in reverse order.',
                        fr: 'Afficher les élements dans un sens inversé.'
                    },
                    type: 'radio',
                    key: 'reverse',
                    value: reverse
                },
                {
                    label: {
                        en: "Elements' position on primary axis",
                        fr: "Position des élements sur l'axe principal"
                    },
                    desc: {
                        en: '',
                        fr: ''
                    },
                    type: 'select',
                    key: 'justifyContent',
                    value: justifyContents,
                    options: {
                        wwObject: {},
                        values: [
                            {
                                value: 'flex-start',
                                text: {
                                    en: 'Start',
                                    fr: 'Début'
                                }
                            },
                            {
                                value: 'center',
                                default: true,
                                text: {
                                    en: 'Center',
                                    fr: 'Millieu'
                                }
                            },
                            {
                                value: 'flex-end',
                                text: {
                                    en: 'End',
                                    fr: 'Fin'
                                }
                            },
                            {
                                value: 'space-between',
                                text: {
                                    en: 'Space between elements',
                                    fr: 'Espace entre les élements'
                                }
                            },
                            {
                                value: 'space-around',
                                text: {
                                    en: 'Space around elements',
                                    fr: 'Espace autours des élements'
                                }
                            },
                            {
                                value: 'space-evenly',
                                text: {
                                    en: 'Even Spaces around elements',
                                    fr: 'Espace égaux autours des élements'
                                }
                            }
                        ]
                    }
                },
                {
                    label: {
                        en: "Elements' position on secondary axis",
                        fr: "Position des élements sur l'axe secondaire"
                    },
                    desc: {
                        en: '',
                        fr: ''
                    },
                    type: 'select',
                    key: 'alignItems',
                    value: alignItems,
                    options: {
                        wwObject: {},
                        values: [
                            {
                                value: 'flex-start',
                                text: {
                                    en: 'Start',
                                    fr: 'Début'
                                }
                            },
                            {
                                value: 'center',
                                default: true,
                                text: {
                                    en: 'Center',
                                    fr: 'Millieu'
                                }
                            },
                            {
                                value: 'flex-end',
                                text: {
                                    en: 'End',
                                    fr: 'Fin'
                                }
                            },
                            {
                                value: 'stretch',
                                text: {
                                    en: 'Stretch',
                                    fr: 'Etirer'
                                }
                            }
                        ]
                    }
                },
                {
                    label: {
                        en: 'Wrap elements if needed (For rows only)',
                        fr: "Mettre les élements à la ligne si necessaire (Pour l'affichage en lignes seulement)"
                    },
                    desc: {
                        en: '',
                        fr: ''
                    },
                    type: 'radio',
                    key: 'flexWrap',
                    value: flexWrap === 'wrap'
                },
                {
                    label: {
                        en: 'Min height',
                        fr: 'Hauteur minumale'
                    },
                    desc: {
                        en: "Use 'px' or '%' as unit.",
                        fr: "Utiliser 'px' ou '%' comme unité."
                    },
                    type: 'text',
                    key: 'minHeight',
                    value: minHeight
                }
            ]
        }
    }
});
