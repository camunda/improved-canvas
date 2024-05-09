# Changelog

All notable changes to [@camunda/improved-canvas](https://github.com/camunda/improved-canvas) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 1.5.2

* `FIX`: do not hide context pad on `djs-label-hidden` added

## 1.5.1

* `FIX`: ensure palette is above create pads ([e87000](https://github.com/camunda/improved-canvas/commit/e870002680a5407892f06dbd1be6965f7ff71277))

## 1.5.0

* `FEAT`: context pad always visible as long as elements visible ([#61](https://github.com/camunda/improved-canvas/pull/61))
* `FEAT`: quick append and attach visible as long as elements visible ([#61](https://github.com/camunda/improved-canvas/pull/61))
* `CHORE`: comments icon simplified ([#61](https://github.com/camunda/improved-canvas/pull/61))
* `FIX`: do not show resource linking if start event is inside event subprocess ([#61](https://github.com/camunda/improved-canvas/pull/61))

## 1.4.0

* `FEAT`: add quick append and attach ([#59](https://github.com/camunda/improved-canvas/pull/59))
* `CHORE`: re-order context pad entries ([#60](https://github.com/camunda/improved-canvas/pull/60))
* `CHORE`: make dividers full heigth ([#60](https://github.com/camunda/improved-canvas/pull/60))
* `CHORE`: remove plus from comments icon ([#59](https://github.com/camunda/improved-canvas/pull/59))

## 1.3.3

* `FIX`: do not show feedback button if context pad empty ([#51](https://github.com/camunda/improved-canvas/pull/51))

## 1.3.2

* `FIX`: fix aria role (use `role="button"`) for context pad entries ([#49](https://github.com/camunda/improved-canvas/pull/49))

## 1.3.1

* `FIX`: expose viewer-only module ([#48](https://github.com/camunda/improved-canvas/pull/48))
* `DEPS`: add `bpmn-js-create-append-anything` peer dependency ([#48](https://github.com/camunda/improved-canvas/pull/48))
* `DEPS`: update `diagram-js-grid` to v1.0.0 ([#48](https://github.com/camunda/improved-canvas/pull/48))

## 1.3.0

* `FEAT`: add `resourceLinking.linkResource` rule ([#47](https://github.com/camunda/improved-canvas/pull/47))
* `FIX`: do not show resource linking if element template found ([#47](https://github.com/camunda/improved-canvas/pull/47))

## 1.2.4

* `FIX`: ensure icons are visible in all major browsers ([#42](https://github.com/camunda/improved-canvas/pull/42))
* `FIX`: add `aria-role="button"` to context pad entries ([#44](https://github.com/camunda/improved-canvas/pull/44))

## 1.2.3

* `FIX`: handle labels correctly when opening context pad ([#41](https://github.com/camunda/improved-canvas/pull/41))

## 1.2.2

* `FIX`: namespace CSS to `bio-improved-canvas`([#39](https://github.com/camunda/improved-canvas/pull/39))

## 1.2.1

* `FIX`: don't show append node if connection or no append options ([#35](https://github.com/camunda/improved-canvas/pull/35))

## 1.2.0

* `FEAT`: add feedback button ([#33](https://github.com/camunda/improved-canvas/pull/33))

## 1.1.0

* `FEAT`: add context pad entry to show comments ([#29](https://github.com/camunda/improved-canvas/pull/29))
* `FIX`: allow context pad overflow to show tooltips ([#29](https://github.com/camunda/improved-canvas/pull/29))
* `FIX`: recognize form key ([#31](https://github.com/camunda/improved-canvas/pull/31))

## 1.0.0

* `FEAT`: add call-to-action to context pad for linking BPMN, DMN and Forms ([#24](https://github.com/camunda/improved-canvas/pull/24))
* `FEAT`: update DMN context pad UI ([#22](https://github.com/camunda/improved-canvas/pull/22))
* `FEAT`: add tooltips to context pad ([#20](https://github.com/camunda/improved-canvas/pull/20))
* `FEAT`: add _Common_ group to append popup ([#13](https://github.com/camunda/improved-canvas/pull/13))
* `FEAT`: add seperate feature for appending boundary events ([#12](https://github.com/camunda/improved-canvas/pull/12))
* `FEAT`: add separate feature for appending shapes ([#11](https://github.com/camunda/improved-canvas/pull/11))
* `FEAT`: adjust non-searchable popups ([#9](https://github.com/camunda/improved-canvas/pull/9))

## 0.2.1

* `FIX`: styles are not injected by default ([5403789](https://github.com/camunda/improved-canvas/commit/5403789288696f594f498f1fe31166972e1f895a))

## 0.2.0

* `FEAT`: update context pad UI ([#8](https://github.com/camunda/improved-canvas/pull/8))
* `CHORE`: remove web modeler styles

## 0.1.2

* `FIX`: fix incorrect styles ([cfeb0ef](https://github.com/camunda/improved-canvas/commit/074a8370eb2e07df3f0ab3c05c33a133ea620364))

## 0.1.1

* `FIX`: add missing and fix incorrect styles ([bb9b98f](https://github.com/camunda/improved-canvas/commit/bb9b98f94b30aa28a7316fcfd3b1cbb86691ad7d))

## 0.1.0

Initial release