# Default/Starting project

# Media Queries Splitter

Starting project with media queries splitter included. The purpose of this repo is to test how it works Media Queries Splitter.

==================================================================

## Install Packages

After cloning the project to your computer run the following command in your terminal to install all required node packages.

	1.  npm install
		

## Start

	gulp

## Build

Create a deployment build with the following commands:

	gulp build

## Test App Build

To fire up a server and test the final build:

	gulp build:serve

---------------------------------------

## gulpfile.js
Javascript concatenation is done in the config object in the guilpfile.  This controls the order as well as files to be be concatenated.  I went with a simple system in anticipation of ES6 built-in modules.  The config object also controls which files are EXCLUDED from the final build.