# DEL

FHIR Implementation Guide for CMS Data Element Library

## Setup

This is still a work in progress. More documentation to come.

You will need yarn and java11 installed and on your PATH.

Install dependencies:

    yarn

First run this to generate the output files.

    yarn shr-cli

Then run this to build the HTML implementation guide.

    yarn ig-gen

Congrats. Your guide is now located here:

    out/fhir/guide/output/index.html

## Upload

You can automatically upload the StrucuteDefinition and ImplementationGuide resources to a FHIR server.

Run this command after generating the implementation guide:

    yarn upload
