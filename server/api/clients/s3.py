import boto3, botocore
from cfg.s3 import S3_BUCKET

# TODO: restrict access to s3!
# S3_KEY, S3_SECRET,
# s3 = boto3.client("s3", aws_access_key_id=S3_KEY, aws_secret_access_key=S3_SECRET)
s3 = boto3.client("s3")


def upload_file(file, file_name, acl="public-read"):

    try:

        s3.upload_fileobj(
            file,
            S3_BUCKET,
            file_name,
            ExtraArgs={"ACL": acl, "ContentType": file.content_type},
        )

    except Exception as e:
        # This is a catch all exception, edit this part to fit your needs.
        print("Something Happened: ", e)
        return e
