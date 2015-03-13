GOOGLE_PATH = ../google
BOX2D_HTML5_PATH = ../../..

SOURCE_FILES += 

SOURCE_PATHS += $(BOX2D_HTML5_PATH)/Contributions
SOURCE_PATHS += $(BOX2D_HTML5_PATH)/Box2D/Box2D
SOURCE_PATHS += $(GOOGLE_PATH)/closure-library/third_party/closure/goog
SOURCE_PATHS += $(GOOGLE_PATH)/closure-library/closure/goog

OUTPUT_NAMESPACE = "box2d"
OUTPUT_FILE = box2d-html5.js
OUTPUT_DEP_FILE = deps.js
OUTPUT_MAP_FILE = box2d-html5.map.json

all:
	$(MAKE) --no-print-directory deps
	$(MAKE) --no-print-directory build
	$(MAKE) --no-print-directory run

help:
	@echo done $@

sync:
	$(MAKE) --no-print-directory -C $(GOOGLE_PATH) sync
	@echo done $@

deps:
	$(DEPS_COMMAND)
	@echo done $@

# depswriter needs the relative path from base.js in 
# $(GOOGLE_PATH)/closure-library/closure/goog 
# to this makefile directory
DEPSWRITER_PREFIX = ../../../../Box2D

DEPS_COMMAND += python $(GOOGLE_PATH)/closure-library/closure/bin/build/depswriter.py
DEPS_COMMAND += $(foreach file,$(SOURCE_FILES),--path_with_depspath="$(file) $(DEPSWRITER_PREFIX)/$(file)")
DEPS_COMMAND += $(foreach path,$(SOURCE_PATHS),--root_with_prefix="$(path) $(DEPSWRITER_PREFIX)/$(path)")
DEPS_COMMAND += > $(OUTPUT_DEP_FILE)

clean:
	rm -fv $(OUTPUT_FILE)
	rm -fv $(OUTPUT_DEP_FILE)
	rm -fv $(OUTPUT_MAP_FILE)
	@echo done $@

build:
	$(BUILD_COMMAND)
	@echo done $@

BUILD_COMMAND = java
BUILD_COMMAND += -client
BUILD_COMMAND += -jar $(GOOGLE_PATH)/closure-compiler/compiler.jar
BUILD_COMMAND += --only_closure_dependencies
BUILD_COMMAND += --closure_entry_point $(OUTPUT_NAMESPACE)
BUILD_COMMAND += $(SOURCE_PATHS)
BUILD_COMMAND += $(SOURCE_FILES)
BUILD_COMMAND += --create_source_map=$(OUTPUT_MAP_FILE)
BUILD_COMMAND += --source_map_format=V3
BUILD_COMMAND += --source_map_location_mapping="|"
BUILD_COMMAND += --js_output_file=$(OUTPUT_FILE)
BUILD_COMMAND += $(COMPILER_FLAGS)
BUILD_COMMAND += && printf "\n//\# sourceMappingURL=$(OUTPUT_MAP_FILE)\n" >> $(OUTPUT_FILE)

COMPILER_FLAGS += --generate_exports
# --language_in: ECMASCRIPT3 | ECMASCRIPT5 | ECMASCRIPT5_STRICT
COMPILER_FLAGS += --language_in=ECMASCRIPT5
# --compilation-level: WHITESPACE_ONLY | SIMPLE | ADVANCED
COMPILER_FLAGS += --compilation_level=SIMPLE
COMPILER_FLAGS += --define=goog.DEBUG=false
COMPILER_FLAGS += --define=box2d.DEBUG=false
COMPILER_FLAGS += --jscomp_error=accessControls
COMPILER_FLAGS += --jscomp_error=ambiguousFunctionDecl
COMPILER_FLAGS += --jscomp_error=checkEventfulObjectDisposal
COMPILER_FLAGS += --jscomp_error=checkRegExp
COMPILER_FLAGS += --jscomp_error=checkTypes
COMPILER_FLAGS += --jscomp_error=checkStructDictInheritance
COMPILER_FLAGS += --jscomp_error=checkVars
COMPILER_FLAGS += --jscomp_error=const
COMPILER_FLAGS += --jscomp_error=constantProperty
COMPILER_FLAGS += --jscomp_error=deprecated
COMPILER_FLAGS += --jscomp_error=duplicateMessage
COMPILER_FLAGS += --jscomp_error=es3
COMPILER_FLAGS += --jscomp_error=es5Strict
COMPILER_FLAGS += --jscomp_error=externsValidation
COMPILER_FLAGS += --jscomp_error=fileoverviewTags
COMPILER_FLAGS += --jscomp_error=globalThis
COMPILER_FLAGS += --jscomp_error=internetExplorerChecks
COMPILER_FLAGS += --jscomp_error=invalidCasts
COMPILER_FLAGS += --jscomp_error=misplacedTypeAnnotation
COMPILER_FLAGS += --jscomp_error=missingGetCssName
COMPILER_FLAGS += --jscomp_error=missingProperties
COMPILER_FLAGS += --jscomp_error=missingProvide
COMPILER_FLAGS += --jscomp_error=missingRequire
COMPILER_FLAGS += --jscomp_error=missingReturn
COMPILER_FLAGS += --jscomp_error=newCheckTypes
COMPILER_FLAGS += --jscomp_error=nonStandardJsDocs
#COMPILER_FLAGS += --jscomp_error=reportUnknownTypes
COMPILER_FLAGS += --jscomp_error=strictModuleDepCheck
COMPILER_FLAGS += --jscomp_error=suspiciousCode
COMPILER_FLAGS += --jscomp_error=typeInvalidation
COMPILER_FLAGS += --jscomp_error=undefinedNames
COMPILER_FLAGS += --jscomp_error=undefinedVars
COMPILER_FLAGS += --jscomp_error=unknownDefines
COMPILER_FLAGS += --jscomp_error=uselessCode
#COMPILER_FLAGS += --jscomp_error=useOfGoogBase
COMPILER_FLAGS += --jscomp_error=visibility

run:
	if [[ "$${OSTYPE}" == "cygwin" ]]; then cygstart index.html; fi
	if [[ "$${OSTYPE}" == "darwin"* ]]; then open index.html; fi
	@echo done $@

debug:
	if [[ "$${OSTYPE}" == "cygwin" ]]; then cygstart index-debug.html; fi
	if [[ "$${OSTYPE}" == "darwin"* ]]; then open index-debug.html; fi
	@echo done $@

