# Introduction

This experiment library aims to provide framework-agnostic hooks. Hooks are an
approach for component's state and effect management (popularized by
[React](https://reactjs.org/docs/hooks-intro.html)) which is traditionally tied
to the render lifecycle method of individual component node.

# API usage

You can check the examples in the `mithril` and `react` folders.

# Motivation

When React issues a state update, all hooks are re-run and all components below
in the hierarchy are diffed again. While this is not usually a problem, it might
trigger expensive computations down the tree - those might not only intensive
number-crunching tasks like one would imagine, but also, for instance, issuing
synchronous DOM multiple times, which might stagger the UI when called
repeatedly.

Therefore, it can be said the main motivation of Hooker is to provide the same
state management model, but not tied to the runtime semantics of any specific
framework. Hooks can be ran manually and their latest values will always be
available through a reference, which might be assigned to a variable and
retrieved at any time through an uniform `get`/`set` API.

# Trivia

This library initially started during development of
[subscribed_props](https://github.com/resolritter/subscribed_props). There it
was validated that those fine-grained updates could be achieved on React with
subscriptions.
