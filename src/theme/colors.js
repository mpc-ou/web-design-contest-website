export const colors = {
  light: {
    primary: '#1976d2',
    primaryDark: '#1565c0',
    primaryLight: '#42a5f5',
    secondary: '#9c27b0',
    secondaryDark: '#7b1fa2',
    secondaryLight: '#ba68c8',
    error: '#d32f2f',
    warning: '#ed6c02',
    info: '#0288d1',
    success: '#2e7d32',
    background: '#f5f5f5',
    paper: '#ffffff',
    text: '#212121',
    textSecondary: '#757575'
  },
  dark: {
    primary: '#90caf9',
    primaryDark: '#42a5f5',
    primaryLight: '#bbdefb',
    secondary: '#ce93d8',
    secondaryDark: '#ab47bc',
    secondaryLight: '#e1bee7',
    error: '#f44336',
    warning: '#ff9800',
    info: '#29b6f6',
    success: '#66bb6a',
    background: '#121212',
    paper: '#1e1e1e',
    text: '#ffffff',
    textSecondary: '#b0bec5'
  }
};

export const themeConfigs = {
  light: {
    palette: {
      mode: 'light',
      primary: {
        main: colors.light.primary,
        dark: colors.light.primaryDark,
        light: colors.light.primaryLight,
        contrastText: '#ffffff',
      },
      secondary: {
        main: colors.light.secondary,
        dark: colors.light.secondaryDark,
        light: colors.light.secondaryLight,
      },
      error: {
        main: colors.light.error,
      },
      warning: {
        main: colors.light.warning,
      },
      info: {
        main: colors.light.info,
      },
      success: {
        main: colors.light.success,
      },
      background: {
        default: colors.light.background,
        paper: colors.light.paper,
      },
      text: {
        primary: colors.light.text,
        secondary: colors.light.textSecondary,
      },
    },
    components: {
      MuiAppBar: {
        defaultProps: {
          color: 'default',
        },
        styleOverrides: {
          root: {
            backgroundColor: colors.light.paper,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
            },
          },
          containedPrimary: {
            backgroundColor: colors.light.primary,
            color: '#ffffff',
            '&:hover': {
              backgroundColor: colors.light.primaryDark,
            },
          },
        }
      }
    }
  },
  dark: {
    palette: {
      mode: 'dark',
      primary: {
        main: colors.dark.primary,
        dark: colors.dark.primaryDark,
        light: colors.dark.primaryLight,
        contrastText: '#000000',
      },
      secondary: {
        main: colors.dark.secondary,
        dark: colors.dark.secondaryDark,
        light: colors.dark.secondaryLight,
      },
      error: {
        main: colors.dark.error,
      },
      warning: {
        main: colors.dark.warning,
      },
      info: {
        main: colors.dark.info,
      },
      success: {
        main: colors.dark.success,
      },
      background: {
        default: colors.dark.background,
        paper: colors.dark.paper,
      },
      text: {
        primary: colors.dark.text,
        secondary: colors.dark.textSecondary,
      },
    },
    components: {
      MuiAppBar: {
        defaultProps: {
          color: 'default',
        },
        styleOverrides: {
          root: {
            backgroundColor: colors.dark.paper,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2)',
            },
          },
          containedPrimary: {
            backgroundColor: colors.dark.primary,
            color: '#000000',
            '&:hover': {
              backgroundColor: colors.dark.primaryDark,
            },
          },
        }
      }
    }
  }
};