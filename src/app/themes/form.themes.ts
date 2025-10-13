export const buttonThemes = {
  primary: {
    colorScheme: {
      light: {
        root: {
          primary: {
            background: "#7CB068",
            hoverBackground: "#62995B",
            color: "{stone.100}",
            hoverColor: "{stone.100}",
            activeBackground: "#609758",
            focusBorderColor: "{stone.600}",
            focusRingColor: "{stone.600}",
            borderColor: "transparent",
            activeBorderColor: "transparent",
            hoverBorderColor: "transparent",
          },
          borderRadius: "8px",
        },
      },
    },
  },
  ghost: {
    colorScheme: {
      light: {
        root: {
          primary: {
            background: "{stone.900}",
            hoverBackground: "{stone.800}",
            color: "{stone.400}",
            hoverColor: "{stone.100}",
            activeBackground: "#29252355",
            focusBorderColor: "{stone.600}",
            focusRingColor: "{stone.600}",
            borderColor: "transparent",
            activeBorderColor: "transparent",
            hoverBorderColor: "transparent",
          },
          borderRadius: "8px",
        },
      },
    },
  },
  outlined: {
    colorScheme: {
      light: {
        root: {
          primary: {
            background: "transparent",
            hoverBackground: "#73737320",
            color: "{stone.300}",
            hoverColor: "{stone.200}",
            activeBackground: "{stone.600}",
            focusBorderColor: "{stone.700}",
            focusRingColor: "{stone.700}",
            borderColor: "{stone.600}",
            activeBorderColor: "{stone.600}",
            hoverBorderColor: "{stone.600}",
          },
          danger: {
            background: "transparent",
            hoverBackground: "#EF454420",
            color: "{red.500}",
            hoverColor: "{red.400}",
            activeBackground: "{red.600}",
            focusBorderColor: "{red.700}",
            focusRingColor: "{red.700}",
            borderColor: "{red.600}",
            activeBorderColor: "{red.600}",
            hoverBorderColor: "{red.600}",
          },
          borderRadius: "8px",
        },
      },
    },
  },
};

export const inputThemes = {
  outlined: {
    colorScheme: {
      light: {
        root: {
          background: "#26262677",
          color: "{stone.100}",
          focusBorderColor: "{stone.500}",
          focusRingColor: "{stone.500}",
          borderColor: "{stone.600}",
          hoverBorderColor: "{stone.500}",
          borderRadius: "8px",
        },
      },
    },
  },
};

export const menuThemes = {
  ghost: {
    colorScheme: {
      light: {
        root: {
          borderColor: "{stone.600}",
          background: "{stone.700}",
          borderRadius: "8px",
        },
        item: {
          color: "{stone.100}",
          focusColor: "{stone.100}",
          focusBackground: "{stone.600}",
          icon: {
            color: "{stone.400}",
            focusColor: "{stone.100}",
          },
        },
        submenuLabel: {
          fontWeight: "400",
          padding: "0.2rem 0.5rem 0 0.5rem",
          color: "{stone.400}",
        },
      },
    },
  },
};

export const dialogThemes = {
  custom: {
    colorScheme: {
      light: {
        root: {
          borderColor: "{stone.600}",
          background: "{stone.700}",
          color: "{stone.100}",
          borderRadius: "8px",
        },
        header: {
          gap: "0",
          padding: "1rem 1rem 0.5rem 1rem",
        },
      },
    },
  },
};
