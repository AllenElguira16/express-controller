/**
 * Error Exception Class for Response Errors
 * 
 * @author Michael Allen Elguira <michael01@simplexi.com.ph>
 */
class ResponseError extends Error {
  public code: number;

  constructor(code: number, message: string) {
    super(message);

    this.code = code;
  }
}

export default ResponseError;
