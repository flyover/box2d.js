#
# Copyright (c) Flyover Games, LLC
#

SHELL := /usr/bin/env bash

__default__: help

rwildcard = $(foreach d,$(wildcard $1*),$(call rwildcard,$d/,$2) $(filter $(subst *,%,$2),$d))

OSTYPE := $(shell echo $${OSTYPE})

# trace
T ?= $(if $(findstring trace,$(MAKECMDGOALS)),1)

# debug
D ?= $(if $(findstring debug,$(MAKECMDGOALS)),1)

# verbose
V ?= $(if $(findstring verbose,$(MAKECMDGOALS)),1)

COLOR ?= $(if $(V),,true)

ANSI_NONE	:= $(if $(COLOR),\033[1;0m)
ANSI_BLACK	:= $(if $(COLOR),\033[1;30m)
ANSI_RED	:= $(if $(COLOR),\033[1;31m)
ANSI_GREEN	:= $(if $(COLOR),\033[1;32m)
ANSI_YELLOW	:= $(if $(COLOR),\033[1;33m)
ANSI_BLUE	:= $(if $(COLOR),\033[1;34m)
ANSI_MAGENTA	:= $(if $(COLOR),\033[1;35m)
ANSI_CYAN	:= $(if $(COLOR),\033[1;36m)
ANSI_WHITE	:= $(if $(COLOR),\033[1;37m)

HOST_SYSTEM = unknown
HOST_SUDO = echo HOST_SUDO $1
HOST_OPEN = echo HOST_OPEN $1
HOST_KILL = echo HOST_KILL $1
HOST_BROWSE = echo HOST_BROWSE $1

# linux (Ubuntu)
ifneq (,$(findstring linux,$(OSTYPE)))
  HOST_IS_LINUX = true
  HOST_SYSTEM = linux-x86_64
  HOST_SUDO = sudo $1
  HOST_OPEN = echo HOST_OPEN $1
  HOST_KILL = kill $1
  HOST_BROWSE = ( google-chrome $1 & )
endif

# darwin (OS X)
ifneq (,$(findstring darwin,$(OSTYPE)))
  HOST_IS_DARWIN = true
  HOST_SYSTEM = darwin-x86_64
  HOST_SUDO = sudo $1
  HOST_OPEN = open $1
  HOST_KILL = kill $1
  HOST_BROWSE = ( $(call HOST_OPEN,$1) & )
endif

# cygwin (Windows)
ifneq (,$(findstring cygwin,$(OSTYPE)))
  HOST_IS_CYGWIN = true
  HOST_SYSTEM = windows-x86_64
  HOST_SUDO = $1
  HOST_OPEN = cygstart $1
  HOST_KILL = taskkill /F /T /PID $$( ps -a | awk '{ if ($$1 == pid) { print $$4 } }' pid=$(strip $1) )
  HOST_BROWSE = ( $(call HOST_OPEN,$1) & )
endif

# Release, Debug
BUILDTYPE = $(if $(D),Debug,Release)

# $1: rule
# $2=: message
NOTE = printf "$(ANSI_NONE)note$(ANSI_NONE): $(ANSI_GREEN)%s$(ANSI_NONE)$(if $2, $(ANSI_CYAN)%s$(ANSI_NONE))\n" $1 $2

# $1: rule
# $2=: message
DONE = printf "$(ANSI_NONE)done$(ANSI_NONE): $(ANSI_GREEN)%s$(ANSI_NONE)$(if $2, $(ANSI_MAGENTA)%s$(ANSI_NONE))\n" $1 $2

# $1: rule
# $2=: message
TODO = printf "$(ANSI_NONE)todo$(ANSI_NONE): $(ANSI_GREEN)%s$(ANSI_NONE)$(if $2, $(ANSI_YELLOW)%s$(ANSI_NONE))\n" $1 $2

# $1: rule
# $2=: message
FAIL = printf "$(ANSI_NONE)fail$(ANSI_NONE): $(ANSI_GREEN)%s$(ANSI_NONE)$(if $2, $(ANSI_RED)%s$(ANSI_NONE))\n" $1 $2

# $1: name
# $2=: message
HAVE = $$( hash $1 2>/dev/null ) || ( $(call FAIL,"need \"$1\"",$2) && false )

# $1: output directory
# $2: git url
GIT_CLONE = [ -d $1/.git ] || (git clone $2 $1)

# $1: output directory
# $2: git url
GIT_LATEST = [ -d $1/.git ] && (cd $1 && git pull --recurse-submodules) || (git clone $2 $1 --recurse-submodules)

# $1: output directory
# $2: tag
GIT_CHECKOUT = [ -d $1/.git ] && (cd $1 && git checkout $2)

# $1: output file
# $2: url
CURL_LATEST = [ -e $1 ] && (curl -o $1 -z $1 $2) || (curl -o $1 $2)

# $1: label
SCRIPT_INIT = $(if $(T),$(call NOTE,$1,"script init"),true)

# $1: label
# $2=: code
SCRIPT_EXIT = $(if $(T),$(call NOTE,$1,"script exit"),true) && exit $(or $2,0)

# $1: label
# $2: script
SCRIPT_RUN = $(if $(V),,@) $(if $(T),$(call NOTE,$1,"script run"),true) && ( $2 ) && $(call DONE,$1)

TRACE_PRINT = $(if $(T),$(warning $1))

TRACE_PRINT_MAKE_VARIABLES += $(call TRACE_PRINT,MAKECMDGOALS: "$(MAKECMDGOALS)")
TRACE_PRINT_MAKE_VARIABLES += $(call TRACE_PRINT,MAKEFILE_LIST: "$(MAKEFILE_LIST)")
TRACE_PRINT_MAKE_VARIABLES += $(call TRACE_PRINT,MAKELEVEL: "$(MAKELEVEL)")

TRACE_PRINT_GOAL_VARIABLES += $(call TRACE_PRINT,KEYWORD_GOALS: "$(KEYWORD_GOALS)")
TRACE_PRINT_GOAL_VARIABLES += $(call TRACE_PRINT,COMMAND_GOALS: "$(COMMAND_GOALS)")
TRACE_PRINT_GOAL_VARIABLES += $(call TRACE_PRINT,PROJECT_GOALS: "$(PROJECT_GOALS)")
TRACE_PRINT_GOAL_VARIABLES += $(call TRACE_PRINT,MACHINE_GOALS: "$(MACHINE_GOALS)")
TRACE_PRINT_GOAL_VARIABLES += $(call TRACE_PRINT,OTHER_GOALS: "$(OTHER_GOALS)")

KEYWORD_GOALS = $(filter $(KEYWORDS),$(MAKECMDGOALS))
COMMAND_GOALS = $(filter $(COMMANDS),$(MAKECMDGOALS))
PROJECT_GOALS = $(if $(filter projects,$(KEYWORD_GOALS)),$(PROJECTS),$(filter $(PROJECTS),$(MAKECMDGOALS)))
MACHINE_GOALS = $(if $(filter machines,$(KEYWORD_GOALS)),$(MACHINES),$(filter $(MACHINES),$(MAKECMDGOALS)))
OTHER_GOALS = $(filter-out $(KEYWORDS) $(COMMANDS) $(PROJECTS) $(MACHINES),$(MAKECMDGOALS))

# keywords
KEYWORDS += and on for all trace debug verbose commands projects machines

# commands
COMMANDS += help reset setup clean build stop run

__help__:
	@printf "usage:\n"
	@printf "$$ make <$(ANSI_YELLOW)command$(ANSI_NONE)>-<$(ANSI_YELLOW)project$(ANSI_NONE)>\n"
	@printf "command:\n"
	@printf " $(ANSI_YELLOW)help$(ANSI_NONE)\n"
	@printf " $(ANSI_YELLOW)reset$(ANSI_NONE)\n"
	@printf " $(ANSI_YELLOW)setup$(ANSI_NONE)\n"
	@printf " $(ANSI_YELLOW)clean$(ANSI_NONE)\n"
	@printf " $(ANSI_YELLOW)build$(ANSI_NONE)\n"
	@printf " $(ANSI_YELLOW)stop$(ANSI_NONE)\n"
	@printf " $(ANSI_YELLOW)run$(ANSI_NONE)\n"
	@printf "project:\n"
	@for PROJECT in $(PROJECTS); do printf " $(ANSI_YELLOW)$${PROJECT}$(ANSI_NONE)\n"; done

DEFAULT_COMMAND = help

$(DEFAULT_COMMAND)-%: ; @ $(call TODO,$@)

DEFAULT_PROJECT = default

default-help:__help__;@true
default-%: ; @ $(call DONE,$*)

# setup-have

setup-have-git:			; @ $(call HAVE,git,"install")					&& $(call DONE,$@)
setup-have-curl:		; @ $(call HAVE,curl,"install")					&& $(call DONE,$@)
setup-have-python:		; @ $(call HAVE,python,"install")				&& $(call DONE,$@)
setup-have-java:		; @ $(call HAVE,java,"install from java.com")			&& $(call DONE,$@)
setup-have-ant:			; @ $(call HAVE,ant,"install from ant.apache.org")		&& $(call DONE,$@)
setup-have-node:		; @ $(call HAVE,node,"install from nodejs.org")			&& $(call DONE,$@)
setup-have-npm:			; @ $(call HAVE,npm,"install from nodejs.org")			&& $(call DONE,$@)
setup-have-node-gyp:		; @ $(call HAVE,$(HOST_NODE_GYP),"install using npm")		&& $(call DONE,$@)
setup-have-node-inspector:	; @ $(call HAVE,$(HOST_NODE_INSPECTOR),"install using npm")	&& $(call DONE,$@)
setup-have-cordova:		; @ $(call HAVE,$(HOST_CORDOVA),"install using npm")		&& $(call DONE,$@)

# google

default-setup: google-setup

GOOGLE_PATH ?= google

GOOGLE_CLOSURE_COMPILER_URL ?= https://github.com/google/closure-compiler.git
GOOGLE_CLOSURE_COMPILER_REVISION ?=

GOOGLE_CLOSURE_LIBRARY_URL ?= https://github.com/google/closure-library.git
GOOGLE_CLOSURE_LIBRARY_REVISION ?=

# $(GOOGLE_PATH)/closure-library/closure/bin/build/depswriter.py --help

# $(call GOOGLE_DEPSWRITER_SCRIPT, foo/path1 foo/path2, foo/file1.js foo/file2.js, foo.dep.js)
# $1: SOURCE_JS_PATHS
# $2: SOURCE_JS_FILES
# $3: OUTPUT_DEP_JS_FILE
# depswriter needs the relative path from base.js to working directory
GOOGLE_DEPSWRITER_SCRIPT = true
GOOGLE_DEPSWRITER_SCRIPT += && export PREFIX=$$(python -c "import os.path; print os.path.relpath('.', '$(GOOGLE_PATH)/closure-library/closure/goog');")
#GOOGLE_DEPSWRITER_SCRIPT += && export PREFIX=$$(node -p "var path = require('path'); path.relative('$(GOOGLE_PATH)/closure-library/closure/goog', '.').split(path.sep).join('/');")
GOOGLE_DEPSWRITER_SCRIPT += && python $(GOOGLE_PATH)/closure-library/closure/bin/build/depswriter.py
GOOGLE_DEPSWRITER_SCRIPT += $(foreach path,$1,--root_with_prefix="$(path) $${PREFIX}/$(path)")
GOOGLE_DEPSWRITER_SCRIPT += $(foreach file,$2,--path_with_depspath="$(file) $${PREFIX}/$(file)")
GOOGLE_DEPSWRITER_SCRIPT += > $3

GOOGLE_DEPSWRITER_DEPS += $(GOOGLE_PATH)/closure-library/closure/bin/build/depswriter.py

# java -jar $(GOOGLE_PATH)/closure-compiler/compiler.jar --help

GOOGLE_COMPILER_FLAGS += --generate_exports
# --language_in: ECMASCRIPT3 | ECMASCRIPT5 | ECMASCRIPT5_STRICT
GOOGLE_COMPILER_FLAGS += --language_in=ECMASCRIPT5
# --compilation-level: WHITESPACE_ONLY | SIMPLE | ADVANCED
GOOGLE_COMPILER_FLAGS += --compilation_level=SIMPLE
GOOGLE_COMPILER_FLAGS += --define=goog.DEBUG=false
GOOGLE_COMPILER_FLAGS += --jscomp_error=accessControls
GOOGLE_COMPILER_FLAGS += --jscomp_error=ambiguousFunctionDecl
GOOGLE_COMPILER_FLAGS += --jscomp_error=checkEventfulObjectDisposal
GOOGLE_COMPILER_FLAGS += --jscomp_error=checkRegExp
GOOGLE_COMPILER_FLAGS += --jscomp_error=checkStructDictInheritance
GOOGLE_COMPILER_FLAGS += --jscomp_error=checkTypes
GOOGLE_COMPILER_FLAGS += --jscomp_error=checkVars
GOOGLE_COMPILER_FLAGS += --jscomp_error=const
GOOGLE_COMPILER_FLAGS += --jscomp_error=constantProperty
GOOGLE_COMPILER_FLAGS += --jscomp_error=deprecated
GOOGLE_COMPILER_FLAGS += --jscomp_error=duplicateMessage
GOOGLE_COMPILER_FLAGS += --jscomp_error=es3
GOOGLE_COMPILER_FLAGS += --jscomp_error=es5Strict
GOOGLE_COMPILER_FLAGS += --jscomp_error=externsValidation
GOOGLE_COMPILER_FLAGS += --jscomp_error=fileoverviewTags
GOOGLE_COMPILER_FLAGS += --jscomp_error=globalThis
GOOGLE_COMPILER_FLAGS += --jscomp_error=inferredConstCheck
GOOGLE_COMPILER_FLAGS += --jscomp_error=internetExplorerChecks
GOOGLE_COMPILER_FLAGS += --jscomp_error=invalidCasts
GOOGLE_COMPILER_FLAGS += --jscomp_error=misplacedTypeAnnotation
GOOGLE_COMPILER_FLAGS += --jscomp_error=missingGetCssName
GOOGLE_COMPILER_FLAGS += --jscomp_error=missingProperties
GOOGLE_COMPILER_FLAGS += --jscomp_error=missingProvide
#GOOGLE_COMPILER_FLAGS += --jscomp_error=missingRequire
GOOGLE_COMPILER_FLAGS += --jscomp_error=missingReturn
GOOGLE_COMPILER_FLAGS += --jscomp_error=newCheckTypes
GOOGLE_COMPILER_FLAGS += --jscomp_error=nonStandardJsDocs
#GOOGLE_COMPILER_FLAGS += --jscomp_error=reportUnknownTypes
GOOGLE_COMPILER_FLAGS += --jscomp_error=strictModuleDepCheck
GOOGLE_COMPILER_FLAGS += --jscomp_error=suspiciousCode
GOOGLE_COMPILER_FLAGS += --jscomp_error=typeInvalidation
GOOGLE_COMPILER_FLAGS += --jscomp_error=undefinedNames
GOOGLE_COMPILER_FLAGS += --jscomp_error=undefinedVars
GOOGLE_COMPILER_FLAGS += --jscomp_error=unknownDefines
GOOGLE_COMPILER_FLAGS += --jscomp_error=uselessCode
#GOOGLE_COMPILER_FLAGS += --jscomp_error=useOfGoogBase
GOOGLE_COMPILER_FLAGS += --jscomp_error=visibility

# $(call GOOGLE_CLOSURE_COMPILER_SCRIPT, "foo", foo/path1 foo/path2, foo/file1.js foo/file2.js, foo/file.ext.js, foo.map.json, foo.min.js)
# $1: OUTPUT_NAMESPACE
# $2: SOURCE_JS_PATHS
# $3: SOURCE_JS_FILES
# $4: SOURCE_EXT_JS_FILES
# $5: OUTPUT_MAP_JSON_FILE
# $6: OUTPUT_MIN_JS_FILE
# $7: COMPILER_FLAGS
GOOGLE_CLOSURE_COMPILER_SCRIPT = java
GOOGLE_CLOSURE_COMPILER_SCRIPT += -client
GOOGLE_CLOSURE_COMPILER_SCRIPT += -jar $(GOOGLE_PATH)/closure-compiler/compiler.jar
GOOGLE_CLOSURE_COMPILER_SCRIPT += --only_closure_dependencies
GOOGLE_CLOSURE_COMPILER_SCRIPT += --closure_entry_point $(strip $1)
GOOGLE_CLOSURE_COMPILER_SCRIPT += $(strip $2)
GOOGLE_CLOSURE_COMPILER_SCRIPT += $(strip $3)
GOOGLE_CLOSURE_COMPILER_SCRIPT += $(patsubst %,--externs=%,$(strip $4))
GOOGLE_CLOSURE_COMPILER_SCRIPT += --create_source_map=$(strip $5)
GOOGLE_CLOSURE_COMPILER_SCRIPT += --source_map_format=V3
GOOGLE_CLOSURE_COMPILER_SCRIPT += --source_map_location_mapping="|../../../"
GOOGLE_CLOSURE_COMPILER_SCRIPT += --js_output_file=$(strip $6)
GOOGLE_CLOSURE_COMPILER_SCRIPT += $(strip $7)
GOOGLE_CLOSURE_COMPILER_SCRIPT += && printf "\n//\# sourceMappingURL=../../../$(strip $5)\n" >> $(strip $6)

GOOGLE_CLOSURE_COMPILER_DEPS += $(GOOGLE_PATH)/closure-compiler/compiler.jar

google-setup: google-closure-compiler-setup

google-closure-compiler-setup: setup-have-git
google-closure-compiler-setup: setup-have-python
google-closure-compiler-setup: setup-have-java
#google-closure-compiler-setup: setup-have-ant
google-closure-compiler-setup: SCRIPT = $(call SCRIPT_INIT,$@)
google-closure-compiler-setup: SCRIPT += && $(call NOTE,$@,"download closure compiler")
google-closure-compiler-setup: SCRIPT += && mkdir -p $(GOOGLE_PATH)/closure-compiler
google-closure-compiler-setup: SCRIPT += && curl http://dl.google.com/closure-compiler/compiler-latest.tar.gz
google-closure-compiler-setup: SCRIPT +=      -o $(GOOGLE_PATH)/closure-compiler/compiler-latest.tar.gz
google-closure-compiler-setup: SCRIPT += && tar -xvf $(GOOGLE_PATH)/closure-compiler/compiler-latest.tar.gz
google-closure-compiler-setup: SCRIPT +=      -C $(GOOGLE_PATH)/closure-compiler/
#google-closure-compiler-setup: SCRIPT += && if [ -d $(GOOGLE_PATH)/closure-compiler/.git ]; then
#google-closure-compiler-setup: SCRIPT +=      ( cd $(GOOGLE_PATH)/closure-compiler && git pull )
#google-closure-compiler-setup: SCRIPT +=    else
#google-closure-compiler-setup: SCRIPT +=      rm -rf $(GOOGLE_PATH)/closure-compiler;
#google-closure-compiler-setup: SCRIPT +=      git clone $(GOOGLE_CLOSURE_COMPILER_URL) $(GOOGLE_PATH)/closure-compiler/;
#google-closure-compiler-setup: SCRIPT +=    fi
#google-closure-compiler-setup: SCRIPT += && ( cd $(GOOGLE_PATH)/closure-compiler && git checkout $(GOOGLE_CLOSURE_COMPILER_REVISION) )
#google-closure-compiler-setup: SCRIPT += && $(call NOTE,$@,"build closure compiler")
#google-closure-compiler-setup: SCRIPT += && ( cd $(GOOGLE_PATH)/closure-compiler && ant $(if $(V),-verbose,-quiet) jar )
#google-closure-compiler-setup: SCRIPT += && $(call SCRIPT_EXIT,$@)
google-closure-compiler-setup: ; $(call SCRIPT_RUN,$@,$(SCRIPT))

google-setup: google-closure-library-setup

google-closure-library-setup: setup-have-git
google-closure-library-setup: SCRIPT = $(call SCRIPT_INIT,$@)
google-closure-library-setup: SCRIPT += && $(call NOTE,$@,"download closure library")
google-closure-library-setup: SCRIPT += && if [ -d $(GOOGLE_PATH)/closure-library/.git ]; then
google-closure-library-setup: SCRIPT +=      ( cd $(GOOGLE_PATH)/closure-library && git pull )
google-closure-library-setup: SCRIPT +=    else
google-closure-library-setup: SCRIPT +=      rm -rf $(GOOGLE_PATH)/closure-library;
google-closure-library-setup: SCRIPT +=      git clone $(GOOGLE_CLOSURE_LIBRARY_URL) $(GOOGLE_PATH)/closure-library/;
google-closure-library-setup: SCRIPT +=    fi
google-closure-library-setup: SCRIPT += && ( cd $(GOOGLE_PATH)/closure-library && git checkout $(GOOGLE_CLOSURE_LIBRARY_REVISION) )
google-closure-library-setup: SCRIPT += && $(call SCRIPT_EXIT,$@)
google-closure-library-setup: ; $(call SCRIPT_RUN,$@,$(SCRIPT))

# box2d

PROJECTS += box2d

default-clean: box2d-clean
default-build: box2d-build

BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Box2D.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Collision/b2BroadPhase.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Collision/b2CollideCircle.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Collision/b2CollideEdge.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Collision/b2CollidePolygon.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Collision/b2Collision.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Collision/b2Distance.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Collision/b2DynamicTree.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Collision/b2TimeOfImpact.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Collision/Shapes/b2ChainShape.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Collision/Shapes/b2CircleShape.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Collision/Shapes/b2EdgeShape.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Collision/Shapes/b2PolygonShape.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Collision/Shapes/b2Shape.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Common/b2BlockAllocator.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Common/b2Draw.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Common/b2GrowableStack.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Common/b2Math.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Common/b2Settings.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Common/b2StackAllocator.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Common/b2Timer.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/b2Body.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/b2ContactManager.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/b2Fixture.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/b2Island.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/b2TimeStep.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/b2World.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/b2WorldCallbacks.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Contacts/b2ChainAndCircleContact.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Contacts/b2ChainAndPolygonContact.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Contacts/b2CircleContact.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Contacts/b2Contact.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Contacts/b2ContactFactory.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Contacts/b2ContactSolver.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Contacts/b2EdgeAndCircleContact.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Contacts/b2EdgeAndPolygonContact.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Contacts/b2PolygonAndCircleContact.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Contacts/b2PolygonContact.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Joints/b2AreaJoint.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Joints/b2DistanceJoint.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Joints/b2FrictionJoint.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Joints/b2GearJoint.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Joints/b2Joint.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Joints/b2JointFactory.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Joints/b2MotorJoint.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Joints/b2MouseJoint.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Joints/b2PrismaticJoint.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Joints/b2PulleyJoint.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Joints/b2RevoluteJoint.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Joints/b2RopeJoint.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Joints/b2WeldJoint.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Dynamics/Joints/b2WheelJoint.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Particle/b2Particle.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Particle/b2ParticleGroup.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Particle/b2ParticleSystem.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Particle/b2StackQueue.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Particle/b2VoronoiDiagram.js
BOX2D_SOURCE_JS_FILES += Box2D/Box2D/Rope/b2Rope.js

BOX2D_CONTRIBUTIONS_SOURCE_JS_FILES += Contributions/Enhancements/Controllers/b2BuoyancyController.js
BOX2D_CONTRIBUTIONS_SOURCE_JS_FILES += Contributions/Enhancements/Controllers/b2ConstantAccelController.js
BOX2D_CONTRIBUTIONS_SOURCE_JS_FILES += Contributions/Enhancements/Controllers/b2ConstantForceController.js
BOX2D_CONTRIBUTIONS_SOURCE_JS_FILES += Contributions/Enhancements/Controllers/b2Controller.js
BOX2D_CONTRIBUTIONS_SOURCE_JS_FILES += Contributions/Enhancements/Controllers/b2GravityController.js
BOX2D_CONTRIBUTIONS_SOURCE_JS_FILES += Contributions/Enhancements/Controllers/b2TensorDampingController.js

BOX2D_SOURCE_JS_FILES += $(BOX2D_CONTRIBUTIONS_SOURCE_JS_FILES)

BOX2D_OUTPUT_NAMESPACE = "box2d"
BOX2D_OUTPUT_MIN_JS_FILE = Box2D/Build/Box2D/box2d.min.js
BOX2D_OUTPUT_MAP_JSON_FILE = Box2D/Build/Box2D/box2d.map.json
BOX2D_OUTPUT_DEP_JS_FILE = Box2D/Build/Box2D/box2d.dep.js

BOX2D_OUTPUT_FILES = $(BOX2D_OUTPUT_MIN_JS_FILE) $(BOX2D_OUTPUT_MAP_JSON_FILE) $(BOX2D_OUTPUT_DEP_JS_FILE)

box2d-clean: SCRIPT = $(call SCRIPT_INIT,$@)
box2d-clean: SCRIPT += && rm -f $(BOX2D_OUTPUT_FILES)
box2d-clean: SCRIPT += && $(call SCRIPT_EXIT,$@)
box2d-clean: ; $(call SCRIPT_RUN,$@,$(SCRIPT))

box2d-build: $(BOX2D_OUTPUT_FILES)
box2d-build: SCRIPT = $(call SCRIPT_INIT,$@)
box2d-build: SCRIPT += && $(call SCRIPT_EXIT,$@)
box2d-build: ; $(call SCRIPT_RUN,$@,$(SCRIPT))

$(BOX2D_OUTPUT_DEP_JS_FILE): $(GOOGLE_DEPSWRITER_DEPS)
$(BOX2D_OUTPUT_DEP_JS_FILE): $(GOOGLE_PATH)/closure-library/closure/goog/base.js
$(BOX2D_OUTPUT_DEP_JS_FILE): $(BOX2D_SOURCE_JS_FILES)
$(BOX2D_OUTPUT_DEP_JS_FILE): SOURCE_JS_FILES += $(GOOGLE_PATH)/closure-library/closure/goog/base.js
$(BOX2D_OUTPUT_DEP_JS_FILE): SOURCE_JS_FILES += $(BOX2D_SOURCE_JS_FILES)
$(BOX2D_OUTPUT_DEP_JS_FILE): SCRIPT = $(call SCRIPT_INIT,$@)
$(BOX2D_OUTPUT_DEP_JS_FILE): SCRIPT += && $(call GOOGLE_DEPSWRITER_SCRIPT,
$(BOX2D_OUTPUT_DEP_JS_FILE): SCRIPT +=      $(SOURCE_JS_PATHS), $(SOURCE_JS_FILES),
$(BOX2D_OUTPUT_DEP_JS_FILE): SCRIPT +=      $(BOX2D_OUTPUT_DEP_JS_FILE))
$(BOX2D_OUTPUT_DEP_JS_FILE): SCRIPT += && $(call SCRIPT_EXIT,$@)
$(BOX2D_OUTPUT_DEP_JS_FILE): ; $(call SCRIPT_RUN,$@,$(SCRIPT))

$(BOX2D_OUTPUT_MIN_JS_FILE): $(GOOGLE_CLOSURE_COMPILER_DEPS)
$(BOX2D_OUTPUT_MIN_JS_FILE): $(GOOGLE_PATH)/closure-library/closure/goog/base.js
$(BOX2D_OUTPUT_MIN_JS_FILE): $(BOX2D_SOURCE_JS_FILES)
$(BOX2D_OUTPUT_MIN_JS_FILE): SOURCE_JS_FILES += $(GOOGLE_PATH)/closure-library/closure/goog/base.js
$(BOX2D_OUTPUT_MIN_JS_FILE): SOURCE_JS_FILES += $(BOX2D_SOURCE_JS_FILES)
$(BOX2D_OUTPUT_MIN_JS_FILE): SCRIPT = $(call SCRIPT_INIT,$@)
$(BOX2D_OUTPUT_MIN_JS_FILE): SCRIPT += && $(call GOOGLE_CLOSURE_COMPILER_SCRIPT,
$(BOX2D_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(BOX2D_OUTPUT_NAMESPACE),
$(BOX2D_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(SOURCE_JS_PATHS), $(SOURCE_JS_FILES),
$(BOX2D_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(SOURCE_EXT_JS_FILES),
$(BOX2D_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(BOX2D_OUTPUT_MAP_JSON_FILE),
$(BOX2D_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(BOX2D_OUTPUT_MIN_JS_FILE),
$(BOX2D_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(GOOGLE_COMPILER_FLAGS))
$(BOX2D_OUTPUT_MIN_JS_FILE): SCRIPT += && $(call SCRIPT_EXIT,$@)
$(BOX2D_OUTPUT_MIN_JS_FILE): ; $(call SCRIPT_RUN,$@,$(SCRIPT))

$(BOX2D_OUTPUT_MAP_JSON_FILE): $(BOX2D_OUTPUT_MIN_JS_FILE)
$(BOX2D_OUTPUT_MAP_JSON_FILE): SCRIPT = $(call SCRIPT_INIT,$@)
$(BOX2D_OUTPUT_MAP_JSON_FILE): SCRIPT += && touch $@
$(BOX2D_OUTPUT_MAP_JSON_FILE): SCRIPT += && $(call SCRIPT_EXIT,$@)
$(BOX2D_OUTPUT_MAP_JSON_FILE): ; $(call SCRIPT_RUN,$@,$(SCRIPT))

box2d-run: SCRIPT = $(call SCRIPT_INIT,$@)
box2d-run: SCRIPT += && $(call HOST_BROWSE,"Box2D/Build/Box2D/"$(if $(D),"index-debug.html","index.html"))
box2d-run: SCRIPT += && $(call SCRIPT_EXIT,$@)
box2d-run: ; $(call SCRIPT_RUN,$@,$(SCRIPT))

# box2d-helloworld

PROJECTS += box2d-helloworld

default-clean: box2d-helloworld-clean
default-build: box2d-helloworld-build

BOX2D_HELLOWORLD_SOURCE_JS_FILES += Box2D/HelloWorld/HelloWorld.js
BOX2D_HELLOWORLD_SOURCE_JS_FILES += Box2D/Build/HelloWorld/main.js

#BOX2D_HELLOWORLD_OUTPUT_NAMESPACE = "box2d.HelloWorld"
BOX2D_HELLOWORLD_OUTPUT_NAMESPACE = "main.start"
BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE = Box2D/Build/HelloWorld/box2d-helloworld.min.js
BOX2D_HELLOWORLD_OUTPUT_MAP_JSON_FILE = Box2D/Build/HelloWorld/box2d-helloworld.map.json
BOX2D_HELLOWORLD_OUTPUT_DEP_JS_FILE = Box2D/Build/HelloWorld/box2d-helloworld.dep.js

BOX2D_HELLOWORLD_OUTPUT_FILES = $(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE) $(BOX2D_HELLOWORLD_OUTPUT_MAP_JSON_FILE) $(BOX2D_HELLOWORLD_OUTPUT_DEP_JS_FILE)

box2d-helloworld-clean: SCRIPT = $(call SCRIPT_INIT,$@)
box2d-helloworld-clean: SCRIPT += && rm -f $(BOX2D_HELLOWORLD_OUTPUT_FILES)
box2d-helloworld-clean: SCRIPT += && $(call SCRIPT_EXIT,$@)
box2d-helloworld-clean: ; $(call SCRIPT_RUN,$@,$(SCRIPT))

box2d-helloworld-build: $(BOX2D_HELLOWORLD_OUTPUT_FILES)
box2d-helloworld-build: SCRIPT = $(call SCRIPT_INIT,$@)
box2d-helloworld-build: SCRIPT += && $(call SCRIPT_EXIT,$@)
box2d-helloworld-build: ; $(call SCRIPT_RUN,$@,$(SCRIPT))

$(BOX2D_HELLOWORLD_OUTPUT_DEP_JS_FILE): $(GOOGLE_DEPSWRITER_DEPS)
$(BOX2D_HELLOWORLD_OUTPUT_DEP_JS_FILE): $(GOOGLE_PATH)/closure-library/closure/goog/base.js
$(BOX2D_HELLOWORLD_OUTPUT_DEP_JS_FILE): $(BOX2D_HELLOWORLD_SOURCE_JS_FILES)
$(BOX2D_HELLOWORLD_OUTPUT_DEP_JS_FILE): $(BOX2D_SOURCE_JS_FILES)
$(BOX2D_HELLOWORLD_OUTPUT_DEP_JS_FILE): SOURCE_JS_FILES += $(GOOGLE_PATH)/closure-library/closure/goog/base.js
$(BOX2D_HELLOWORLD_OUTPUT_DEP_JS_FILE): SOURCE_JS_FILES += $(BOX2D_HELLOWORLD_SOURCE_JS_FILES)
$(BOX2D_HELLOWORLD_OUTPUT_DEP_JS_FILE): SOURCE_JS_FILES += $(BOX2D_SOURCE_JS_FILES)
$(BOX2D_HELLOWORLD_OUTPUT_DEP_JS_FILE): SCRIPT = $(call SCRIPT_INIT,$@)
$(BOX2D_HELLOWORLD_OUTPUT_DEP_JS_FILE): SCRIPT += && $(call GOOGLE_DEPSWRITER_SCRIPT,
$(BOX2D_HELLOWORLD_OUTPUT_DEP_JS_FILE): SCRIPT +=      $(SOURCE_JS_PATHS), $(SOURCE_JS_FILES),
$(BOX2D_HELLOWORLD_OUTPUT_DEP_JS_FILE): SCRIPT +=      $(BOX2D_HELLOWORLD_OUTPUT_DEP_JS_FILE))
$(BOX2D_HELLOWORLD_OUTPUT_DEP_JS_FILE): SCRIPT += && $(call SCRIPT_EXIT,$@)
$(BOX2D_HELLOWORLD_OUTPUT_DEP_JS_FILE): ; $(call SCRIPT_RUN,$@,$(SCRIPT))

$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): $(GOOGLE_CLOSURE_COMPILER_DEPS)
$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): $(GOOGLE_PATH)/closure-library/closure/goog/base.js
$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): $(BOX2D_HELLOWORLD_SOURCE_JS_FILES)
$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): $(BOX2D_SOURCE_JS_FILES)
$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): SOURCE_JS_FILES += $(GOOGLE_PATH)/closure-library/closure/goog/base.js
$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): SOURCE_JS_FILES += $(BOX2D_HELLOWORLD_SOURCE_JS_FILES)
$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): SOURCE_JS_FILES += $(BOX2D_SOURCE_JS_FILES)
$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): SCRIPT = $(call SCRIPT_INIT,$@)
$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): SCRIPT += && $(call GOOGLE_CLOSURE_COMPILER_SCRIPT,
$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(BOX2D_HELLOWORLD_OUTPUT_NAMESPACE),
$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(SOURCE_JS_PATHS), $(SOURCE_JS_FILES),
$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(SOURCE_EXT_JS_FILES),
$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(BOX2D_HELLOWORLD_OUTPUT_MAP_JSON_FILE),
$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE),
$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(GOOGLE_COMPILER_FLAGS))
$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): SCRIPT += && $(call SCRIPT_EXIT,$@)
$(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE): ; $(call SCRIPT_RUN,$@,$(SCRIPT))

$(BOX2D_HELLOWORLD_OUTPUT_MAP_JSON_FILE): $(BOX2D_HELLOWORLD_OUTPUT_MIN_JS_FILE)
$(BOX2D_HELLOWORLD_OUTPUT_MAP_JSON_FILE): SCRIPT = $(call SCRIPT_INIT,$@)
$(BOX2D_HELLOWORLD_OUTPUT_MAP_JSON_FILE): SCRIPT += && touch $@
$(BOX2D_HELLOWORLD_OUTPUT_MAP_JSON_FILE): SCRIPT += && $(call SCRIPT_EXIT,$@)
$(BOX2D_HELLOWORLD_OUTPUT_MAP_JSON_FILE): ; $(call SCRIPT_RUN,$@,$(SCRIPT))

box2d-helloworld-run: SCRIPT = $(call SCRIPT_INIT,$@)
box2d-helloworld-run: SCRIPT += && $(call HOST_BROWSE,"Box2D/Build/HelloWorld/"$(if $(D),"index-debug.html","index.html"))
box2d-helloworld-run: SCRIPT += && $(call SCRIPT_EXIT,$@)
box2d-helloworld-run: ; $(call SCRIPT_RUN,$@,$(SCRIPT))

# box2d-testbed

PROJECTS += box2d-testbed

default-clean: box2d-testbed-clean
default-build: box2d-testbed-build
default-run: box2d-testbed-run

BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Framework/DebugDraw.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Framework/FullscreenUI.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Framework/Main.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Framework/ParticleEmitter.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Framework/ParticleParameter.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Framework/Test.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Testbed.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/AddPair.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/AntiPointy.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/ApplyForce.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/BasicSliderCrank.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/BlobTest.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/BodyTypes.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Breakable.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Bridge.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/BulletTest.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/BuoyancyTest.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Cantilever.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Car.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Chain.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/CharacterCollision.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/CollisionFiltering.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/CollisionProcessing.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/CompoundShapes.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Confined.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/ContinuousTest.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/ConvexHull.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/ConveyorBelt.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/CornerCase.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/DamBreak.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/DistanceTest.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Dominos.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/DominoTower.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/DrawingParticles.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/DumpShell.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/DynamicTreeTest.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/EdgeShapes.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/EdgeTest.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/ElasticParticles.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Empty.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/EyeCandy.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Faucet.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Fracker.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Gears.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/HeavyOnLight.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/HeavyOnLightTwo.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Impulse.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/LiquidTimer.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Maxwell.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Mobile.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/MobileBalanced.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/MotorJoint.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/MultipleParticleSystems.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/OneSidedPlatform.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Particles.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/ParticlesSurfaceTension.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Pinball.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Pointy.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/PolyCollision.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/PolyShapes.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Prismatic.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Pulleys.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Pyramid.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/PyramidTopple.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Ramp.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/RayCast.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Revolute.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/RigidParticles.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Rope.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/RopeJoint.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Sandbox.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/SensorTest.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/ShapeEditing.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/SliderCrank.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Soup.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/SoupStirrer.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Sparky.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/SphereStack.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/TestCCD.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/TestEntries.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/TestRagdoll.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/TestStack.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/TheoJansen.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Tiles.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/TimeOfImpact.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/TopdownCar.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Tumbler.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/VaryingFriction.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/VaryingRestitution.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/VerticalStack.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/WaveMachine.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Testbed/Tests/Web.js
BOX2D_TESTBED_SOURCE_JS_FILES += Box2D/Build/Testbed/main.js

#BOX2D_TESTBED_OUTPUT_NAMESPACE = "box2d.Testbed"
BOX2D_TESTBED_OUTPUT_NAMESPACE = "main.start"
BOX2D_TESTBED_OUTPUT_MIN_JS_FILE = Box2D/Build/Testbed/box2d-testbed.min.js
BOX2D_TESTBED_OUTPUT_MAP_JSON_FILE = Box2D/Build/Testbed/box2d-testbed.map.json
BOX2D_TESTBED_OUTPUT_DEP_JS_FILE = Box2D/Build/Testbed/box2d-testbed.dep.js

BOX2D_TESTBED_OUTPUT_FILES = $(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE) $(BOX2D_TESTBED_OUTPUT_MAP_JSON_FILE) $(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE)

box2d-testbed-clean: SCRIPT = $(call SCRIPT_INIT,$@)
box2d-testbed-clean: SCRIPT += && rm -f $(BOX2D_TESTBED_OUTPUT_FILES)
box2d-testbed-clean: SCRIPT += && $(call SCRIPT_EXIT,$@)
box2d-testbed-clean: ; $(call SCRIPT_RUN,$@,$(SCRIPT))

box2d-testbed-build: $(BOX2D_TESTBED_OUTPUT_FILES)
box2d-testbed-build: SCRIPT = $(call SCRIPT_INIT,$@)
box2d-testbed-build: SCRIPT += && $(call SCRIPT_EXIT,$@)
box2d-testbed-build: ; $(call SCRIPT_RUN,$@,$(SCRIPT))

$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): $(GOOGLE_DEPSWRITER_DEPS)
$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): $(GOOGLE_PATH)/closure-library/closure/goog
$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): $(GOOGLE_PATH)/closure-library/third_party/closure/goog
#$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): $(GOOGLE_PATH)/closure-library/closure/goog/base.js
$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): $(BOX2D_TESTBED_SOURCE_JS_FILES)
$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): $(BOX2D_SOURCE_JS_FILES)
$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): SOURCE_JS_PATHS += $(GOOGLE_PATH)/closure-library/closure/goog
$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): SOURCE_JS_PATHS += $(GOOGLE_PATH)/closure-library/third_party/closure/goog
#$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): SOURCE_JS_FILES += $(GOOGLE_PATH)/closure-library/closure/goog/base.js
$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): SOURCE_JS_FILES += $(BOX2D_TESTBED_SOURCE_JS_FILES)
$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): SOURCE_JS_FILES += $(BOX2D_SOURCE_JS_FILES)
$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): SCRIPT = $(call SCRIPT_INIT,$@)
$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): SCRIPT += && $(call GOOGLE_DEPSWRITER_SCRIPT,
$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): SCRIPT +=      $(SOURCE_JS_PATHS), $(SOURCE_JS_FILES),
$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): SCRIPT +=      $(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE))
$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): SCRIPT += && $(call SCRIPT_EXIT,$@)
$(BOX2D_TESTBED_OUTPUT_DEP_JS_FILE): ; $(call SCRIPT_RUN,$@,$(SCRIPT))

$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): $(GOOGLE_CLOSURE_COMPILER_DEPS)
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): $(GOOGLE_PATH)/closure-library/closure/goog
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): $(GOOGLE_PATH)/closure-library/third_party/closure/goog
#$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): $(GOOGLE_PATH)/closure-library/closure/goog/base.js
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): $(BOX2D_TESTBED_SOURCE_JS_FILES)
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): $(BOX2D_SOURCE_JS_FILES)
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): SOURCE_JS_PATHS += $(GOOGLE_PATH)/closure-library/closure/goog
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): SOURCE_JS_PATHS += $(GOOGLE_PATH)/closure-library/third_party/closure/goog
#$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): SOURCE_JS_FILES += $(GOOGLE_PATH)/closure-library/closure/goog/base.js
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): SOURCE_JS_FILES += $(BOX2D_TESTBED_SOURCE_JS_FILES)
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): SOURCE_JS_FILES += $(BOX2D_SOURCE_JS_FILES)
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): SCRIPT = $(call SCRIPT_INIT,$@)
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): SCRIPT += && $(call GOOGLE_CLOSURE_COMPILER_SCRIPT,
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(BOX2D_TESTBED_OUTPUT_NAMESPACE),
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(SOURCE_JS_PATHS), $(SOURCE_JS_FILES),
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(SOURCE_EXT_JS_FILES),
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(BOX2D_TESTBED_OUTPUT_MAP_JSON_FILE),
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE),
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): SCRIPT +=      $(GOOGLE_COMPILER_FLAGS))
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): SCRIPT += && $(call SCRIPT_EXIT,$@)
$(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE): ; $(call SCRIPT_RUN,$@,$(SCRIPT))

$(BOX2D_TESTBED_OUTPUT_MAP_JSON_FILE): $(BOX2D_TESTBED_OUTPUT_MIN_JS_FILE)
$(BOX2D_TESTBED_OUTPUT_MAP_JSON_FILE): SCRIPT = $(call SCRIPT_INIT,$@)
$(BOX2D_TESTBED_OUTPUT_MAP_JSON_FILE): SCRIPT += && touch $@
$(BOX2D_TESTBED_OUTPUT_MAP_JSON_FILE): SCRIPT += && $(call SCRIPT_EXIT,$@)
$(BOX2D_TESTBED_OUTPUT_MAP_JSON_FILE): ; $(call SCRIPT_RUN,$@,$(SCRIPT))

box2d-testbed-run: SCRIPT = $(call SCRIPT_INIT,$@)
box2d-testbed-run: SCRIPT += && $(call HOST_BROWSE,"Box2D/Build/Testbed/"$(if $(D),"index-debug.html","index.html"))
box2d-testbed-run: SCRIPT += && $(call SCRIPT_EXIT,$@)
box2d-testbed-run: ; $(call SCRIPT_RUN,$@,$(SCRIPT))

# rules

# link each command to default
$(foreach command,$(COMMANDS),\
  $(eval $(command): default-$(command) ; @true)\
)

# generate verb/noun (<command>-<project>) aliases
$(foreach project,$(PROJECTS),\
  $(foreach command,$(COMMANDS),\
    $(eval $(command)-$(project): $(project)-$(command) ; @true)\
  )\
)

# generate default rule for each project
$(foreach project,$(PROJECTS),\
  $(eval $(project)-%: ; @ $(call TODO,$$@))\
)

