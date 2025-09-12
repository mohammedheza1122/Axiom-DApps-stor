const STATE_KEY_ENUM = Object.freeze({
  headlineStudioHasMounted: 'headlineStudioHasMounted',
});

const DEFAULT_STATE = {
  [STATE_KEY_ENUM.headlineStudioHasMounted]: false,
};

const actions = {
  setHeadlineStudioHasMounted() {
    return {
      type: 'SET_HEADLINE_STUDIO_HAS_MOUNTED',
      hasMounted: true,
    };
  },
};

const reducer = (state = DEFAULT_STATE, action) => {
  switch (action.type) {
    case 'SET_HEADLINE_STUDIO_HAS_MOUNTED':
      return {
        ...state,
        [STATE_KEY_ENUM.headlineStudioHasMounted]: action.hasMounted,
      };
    case 'START_RESOLUTION':
    case 'FINISH_RESOLUTION':
      return state;

    default:
      // these action types are wordpress related, ignore
      console.log(`Unknown Action Type - ${action.type}`);
      return state;
  }
};
const selectors = {
  getHeadlineStudioHasMounted(state) {
    return state[STATE_KEY_ENUM.headlineStudioHasMounted];
  },
};

export const headlineStudioStoreKey = 'headline-studio-store';
export const headlineStudioStoreConfig = {
  reducer,
  actions,
  selectors,
};
