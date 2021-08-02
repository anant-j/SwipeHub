export const navigation = {
  methods: {
    toHomePage() {
      this.$store.state.sessionState = 0;
    },
    toJoinSessionPage() {
      this.$store.state.sessionState = 1;
    },
    toCreateSessionPage() {
      this.$store.state.sessionState = 2;
    },
  },
};
