# A Social Cellular Automata and Generative Art Experiment

NOTE: This is currently the pre-release. This means menus may be disabled, styling maybe be broken, routing may be disabled, and certain optimizations may still be missing.

## What is this?

An app to generate [cellular automata](https://en.wikipedia.org/wiki/Cellular_automaton)

1D, 2D, and 3D cell populations can be fully rendered in a 1, 2 or 3 dimension viewer.
The cell population shape, state, rules, and neighbors can all be customized with a high degree of flexibility.

This repo contains the code for
1. the `http://cell.af` app,
2. a cellular automata generator
3. a cellular automata visualizer

In the future, the generator and visualizer will be broken out into their own repos

## Layout

With regards to the /src folder:

#### /assets

Images, fonts, etc...

#### /docs

Markdown files that are rendered into documentation for the app. These need to be registered in the `Documentation` scene, which will allow the app to parse the files with the correct styling and configure the router to be aware of them.

#### /features

Components that are scene agnostic. They don't know their positioning in the app or what other features are being shown in a scene. Their role is to encapsulate feature logic.

#### /libs

Code that should be broken out into independent repos. This also includes files like `OrbitControls`, which is an extension for Three.js. The Three.js community tends to do extensions as single files that you drop into your repo. `/libs` also includes `query-string` and `strict-uri-encode` which weren't bundled correctly and thus give problems during the build phase of the app if they are used as node_module dependencies. Thus, they have been moved into the app.

#### /scenes

Routeable components that are composed of one or more feature. Scenes can be stacked or swapped for one another and custom transitions can be defined for movement between specific pairs.

#### /services

Business and helper logic used by the app.

`/services/router` contains the routing service which controls movement around the app and how router query strings are resolved

#### /state

The mobx state tree (MST) models. These are used to sync application state between various features and services

## RELEASE TODO

1. Hook mobx changes into automata viewer. AKA: changing a menu field will change the automata.
2. Make popups appear correctly when the menu is docked in different positions
3. Add media queries to the Documentation scene
4. Add media queries to the View scene
5. Improve styling of View scene (background opacity, padding around docked menu items, docked vs undocked styles, etc...)
6. Add popup menu for rule selection
7. Add popup menu for neighbor selection
8. Add popup menu for genesis customization
9. Add media player controls (pause, rewind, reverse direction, jump to time)
10. Add snapshot tests to scenes and features
11. Add unit tests for `services`, `state`, custom `libs`, and maybe a few components, if necessary
12. Add flowtypes

## ROADMAP

- Add the ability to record an automata
- Add the ability to share an automata
- Explore automata the community has created
