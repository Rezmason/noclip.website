type PlusDataSet = {
  basePath: string,
  variants: Record<string, string[]>
}

export const dataSets: Record<string, PlusDataSet> = {
  mercury_pool: {
    basePath: "Screensavers/Mercury Pool/Media/",
    variants: {
      cavern: [
        "Mercury_Pool_Cave_Scene.scx",
        "Mercury_Pool_Cave_Camera.scx",

        "Mercury_Pool_Drop.scx",
        "Mercury_Pool_Splash.scx",
      ],
      industrial: [
        "Mercury_Pool_Tech_Scene.scx",
        "Mercury_Pool_Tech_Camera.scx",
        "Mercury_Pool_Tech_Sky.scx",

        "Mercury_Pool_Drop.scx",
        "Mercury_Pool_Splash.scx",
      ],
    },
  },
  robot_circus: {
    basePath: "Screensavers/Robot Circus/Media/",
    variants: {
      classic: [
        "Balance_Bar.scx",
        "Balance_Scene.scx",
        "Balance_Stand.scx",
        "Balance_Camera_Coaster.scx",
        "Balance_Camera_Orbit.scx",

        "Balance_Man1A.scx",
        "Balance_Man1AReal.scx",
        "Balance_Man1B.scx",
        "Balance_Man2A.scx",
      ],
      arena: [
        "Balance_Tech_Bar.scx",
        "Balance_Tech_Scene.scx",
        "Balance_Tech_Stand.scx",
        "Balance_Camera_Coaster.scx",
        "Balance_Camera_Orbit.scx",

        "Balance_Man3A.scx",
        "Balance_Man3B.scx",
        "Balance_Man4A.scx",
      ],
    },
  },
  sand_pendulum: {
    basePath: "Screensavers/Sand Pendulum/Media/",
    variants: {
      grotto: [
        "Pendulum_Camera_Orbit.scx",
        "Pendulum_Camera.scx",
        "Pendulum_Camera_Closeup.scx",
        "Pendulum_Sand.scx",
        // "Pendulum_Sand_Particles.scx",
        // "Sparkle.scx",

        // which of these is used?
        // "Pendulum_Pendulum_textures/Pendulum_Pendulum.scx",
        // "Pendulum_SW_Pendulum.scx",

        "Pendulum_SW_Scene.scx",
      ],
      checkerboard: [
        "Pendulum_Camera_Orbit.scx",
        "Pendulum_Camera.scx",
        "Pendulum_Camera_Closeup.scx",
        "Pendulum_Sand.scx",
        // "Pendulum_Sand_Particles.scx",
        // "Sparkle.scx",

        // "Pendulum_Pendulum.scx",
        "Pendulum_Scene.scx",
      ],
    },
  },
};
