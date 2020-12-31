import * as cdk from "@aws-cdk/core";
import * as s3 from "@aws-cdk/aws-s3";
import * as lambda from "@aws-cdk/aws-lambda";
import * as sfn from "@aws-cdk/aws-stepfunctions";
import * as sfnTasks from "@aws-cdk/aws-stepfunctions-tasks";
import * as dynamo from "@aws-cdk/aws-dynamodb";
import { getFunctionPath } from "./utils/utils";

export class EtlLearningStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dataBucket = new s3.Bucket(this, "data", {
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    const dataTable = new dynamo.Table(this, "dataTable", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: { name: "pk", type: dynamo.AttributeType.STRING },
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST
    });

    const hopkinsDataLoader = new lambda.Function(this, "hopkinsDataLoader", {
      code: lambda.Code.fromAsset(getFunctionPath("load-hopkins")),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "handler.handler",
      environment: {
        DATA_BUCKET_NAME: dataBucket.bucketName
      },
      timeout: cdk.Duration.minutes(1)
    });
    dataBucket.grantWrite(hopkinsDataLoader);

    const nytDataLoader = new lambda.Function(this, "nytDataLoader", {
      code: lambda.Code.fromAsset(getFunctionPath("load-nyt")),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "handler.handler",
      environment: {
        DATA_BUCKET_NAME: dataBucket.bucketName
      },
      timeout: cdk.Duration.seconds(10)
    });
    dataBucket.grantWrite(nytDataLoader);

    const dataCombiner = new lambda.Function(this, "dataCombiner", {
      code: lambda.Code.fromAsset(getFunctionPath("combiner")),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "handler.handler",
      environment: {
        DATA_BUCKET_NAME: dataBucket.bucketName
      },
      timeout: cdk.Duration.seconds(10)
    });
    dataBucket.grantReadWrite(dataCombiner);

    const dataWriter = new lambda.Function(this, "dataWriter", {
      code: lambda.Code.fromAsset(getFunctionPath("writer")),
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: "handler.handler",
      environment: {
        DATA_TABLE_NAME: dataTable.tableName
      },
      timeout: cdk.Duration.seconds(10)
    });
    dataTable.grantWriteData(dataWriter);

    const loadHopkins = new sfnTasks.LambdaInvoke(this, "loadHopkins", {
      lambdaFunction: hopkinsDataLoader,
      outputPath: "$.Payload"
    });

    const loadNyt = new sfnTasks.LambdaInvoke(this, "loadNyt", {
      lambdaFunction: nytDataLoader,
      outputPath: "$.Payload"
    });

    const combineData = new sfnTasks.LambdaInvoke(this, "combineData", {
      lambdaFunction: dataCombiner,
      outputPath: "$.Payload"
    });

    const writer = new sfnTasks.LambdaInvoke(this, "writeItems", {
      lambdaFunction: dataWriter
    });

    const writeToDDB = new sfn.Map(this, "writeRecords", {
      maxConcurrency: 40,
      itemsPath: "$"
    }).iterator(writer);

    const definition = new sfn.Parallel(this, "loadData")
      .branch(loadHopkins)
      .branch(loadNyt)
      .next(combineData)
      .next(writeToDDB);

    new sfn.StateMachine(this, "workflowMachine", { definition });

    new cdk.CfnOutput(this, "DataBucketName", {
      value: dataBucket.bucketName
    });

    new cdk.CfnOutput(this, "DataTableName", {
      value: dataTable.tableName
    });
  }
}
