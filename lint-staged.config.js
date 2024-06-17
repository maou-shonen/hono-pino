export default {
  // The Typescript compiler can't type-check a single file, it needs to run on
  // the whole project. To do that we use a function (instead of a string or
  // array) so that no matter what file or how many, we will always run the same
  // command.
  "*.{ts,tsx}": () => "tsc --noEmit",
  "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "*": "prettier --ignore-unknown --write",
};
