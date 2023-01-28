import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

import { color } from './cm_theme_colors.js';

const cruxhTheme = EditorView.theme(
  {
    '&': {
      color: color.primary0,
      backgroundColor: color.grey3,
      fontFamily: 'Fira Code, monospace',
      fontSize: '15px',
    },

    // '.cm-selectionBackground': {
    // 	backgroundColor: 'red'
    // },

    '.cm-content': {
      lineHeight: '1.5em',
    },

    '.cm-cursor, .cm-dropCursor': { borderLeft: `2px solid ${color.primary0}` },

    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: color.grey15,
    },

    '.cm-panels': { backgroundColor: color.black, color: color.primary0, fontSize: '1em' },
    '.cm-panel.cm-search button.cm-button': {
      borderRadius: '2px',
      backgroundColor: color.grey3,
      backgroundImage: 'none',
      color: color.primary0,
      fontSize: '14px',
      fontFamily: 'inherit',
    },
    '.cm-panel.cm-search button[name="close"]': {
      color: color.primary0,
      fontSize: '25px',
    },
    'input.cm-textfield': {
      borderRadius: '2px',
      backgroundColor: color.grey3,
      backgroundImage: 'none',
      color: color.primary0,
      fontSize: '14px',
      fontFamily: 'inherit',
    },
    'input.cm-textfield:focus': {
      outline: 'none',
      boxShadow: `0 0 0 1px ${color.yellow1}`,
    },

    // '.cm-panels.cm-panels-top': { borderBottom: '2px solid black' },
    // '.cm-panels.cm-panels-bottom': { borderTop: '2px solid black' },

    '.cm-searchMatch': {
      backgroundColor: color.grey2,
      outline: `1px solid ${color.yellow2}`,
      borderRadius: '2px',
    },

    '.cm-searchMatch.cm-searchMatch-selected': {
      backgroundColor: color.yellow2,
    },

    '.cm-activeLine': {
      backgroundColor: color.highlight,
      filter: 'brightness(1.3)',
    },

    '.cm-selectionMatch': {
      backgroundColor: color.yellow3,
      outline: `1px solid ${color.yellow2}`,
      borderRadius: '2px',
      filter: 'brightness(1.3)',
      // color: color.yellow0
    },
    '&.cm-focused .cm-nonmatchingBracket span': {
      backgroundColor: color.red2,
      color: `${color.primary0} !important`,
    },
    '&.cm-focused .cm-matchingBracket span': {
      backgroundColor: color.grey1,
      color: `${color.primary0} !important`,
    },

    '.cm-gutters': {
      fontSize: '14px',
      backgroundColor: color.grey3,
      color: color.grey1,
      border: 'none',
    },

    '.cm-line': {
      paddingLeft: '1px',
    },

    '.cm-gutterElement': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      marginLeft: '4px',
      marginRight: '0px',
    },

    '.cm-gutter.cm-foldGutter': {
      paddingRight: '6px',
    },
    '.cm-activeLineGutter': {
      backgroundColor: color.grey3,
      color: color.primary1,
    },

    '.cm-foldPlaceholder': {
      backgroundColor: 'transparent',
      border: 'none',
      color: color.yellow1,
    },

    // '.cm-tooltip': {
    // 	border: 'none',
    // 	backgroundColor: tooltipBackground
    // },
    // '.cm-tooltip .cm-tooltip-arrow:before': {
    // 	borderTopColor: 'transparent',
    // 	borderBottomColor: 'transparent'
    // },
    // '.cm-tooltip .cm-tooltip-arrow:after': {
    // 	borderTopColor: tooltipBackground,
    // 	borderBottomColor: tooltipBackground
    // },
    // '.cm-tooltip-autocomplete': {
    // 	'& > ul > li[aria-selected]': {
    // 		backgroundColor: highlightBackground,
    // 		color: ivory
    // 	}
    // }
  },
  { dark: true }
);

export const cruxhHighlightStyle = HighlightStyle.define([
  { tag: t.comment, color: color.grey0 },
  { tag: t.number, color: color.orange1 },
  { tag: t.string, color: color.olive1 },
  { tag: t.keyword, color: color.lavender1 },
  { tag: t.variableName, fontStyle: 'normal' },
  { tag: [t.punctuation, t.definitionOperator], color: color.primary1 },
  { tag: t.namespace, color: color.primary1, fontStyle: 'italic' },
  { tag: [t.controlOperator, t.derefOperator], color: color.yellow1, fontWeight: 'normal' },
  {
    tag: [t.operatorKeyword],
    color: color.blue0,
    fontStyle: 'italic',
  },
  {
    tag: [t.arithmeticOperator],
    color: color.blue0,
  },
  {
    tag: [t.logicOperator, t.bitwiseOperator, t.compareOperator],
    color: color.primary1,
  },
  { tag: t.typeName, color: color.blue0 },
  { tag: t.annotation, color: color.grey0 },
  // { tag: t.invalid, color: invalid }
]);

// Extension to enable the theme (both the editor theme and
// the highlight style).
export const theme = [cruxhTheme, syntaxHighlighting(cruxhHighlightStyle)];
