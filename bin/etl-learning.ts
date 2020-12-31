import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { EtlLearningStack } from "../lib/etl-learning-stack";

const app = new cdk.App();
new EtlLearningStack(app, "etlLearning");
