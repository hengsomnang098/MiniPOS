

using MiniPOS.API.Common.Constants;

namespace MiniPOS.API.Common.Results
{
    public readonly record struct Error(string Code, string Description)
    {
        public static readonly Error None = new("", "");
        public bool IsNone => string.IsNullOrWhiteSpace(Code);

        // Factory helpers for readability
        public static Error Validation(string message) => new(ErrorCodes.Validation, message);
        public static Error NotFound(string message) => new(ErrorCodes.NotFound, message);
        public static Error Conflict(string message) => new(ErrorCodes.Conflict, message);
        public static Error BadRequest(string message) => new(ErrorCodes.BadRequest, message);
        public static Error Unauthorized(string message) => new(ErrorCodes.Unauthorized, message);
        public static Error Forbidden(string message) => new(ErrorCodes.Forbidden, message);
    }

    public readonly record struct Result
    {
        public bool IsSuccess { get; }
        public Error[] Errors { get; }

        private Result(bool isSuccess, Error[] errors)
            => (IsSuccess, Errors) = (isSuccess, errors);

        public Error FirstError => Errors?.FirstOrDefault() ?? Error.None;

        public static Result Success() => new(true, []);
        public static Result Failure(params Error[] errors) => new(false, errors);
        public static Result NotFound(params Error[] errors) => new(false, errors);
        public static Result BadRequest(params Error[] errors) => new(false, errors);
        public static Result Unauthorized(string message) => new(false, [Error.Unauthorized(message)]);
        public static Result Forbidden(string message) => new(false, [Error.Forbidden(message)]);

        public static Result Combine(params Result[] results)
            => results.Any(r => !r.IsSuccess)
                ? Failure(results.Where(r => !r.IsSuccess).SelectMany(r => r.Errors).ToArray())
                : Success();
    }

    public readonly record struct Result<T>
    {
        public bool IsSuccess { get; }
        public T Value { get; }
        public Error[] Errors { get; }

        private Result(bool isSuccess, T value, Error[] errors)
            => (IsSuccess, Value, Errors) = (isSuccess, value, errors);

        public Error FirstError => Errors?.FirstOrDefault() ?? Error.None;

        public static Result<T> Success(T value) => new(true, value, []);
        public static Result<T> Failure(params Error[] errors) => new(false, default!, errors);
        public static Result<T> NotFound(string message = "") => new(false, default!, [Error.NotFound(message)]);
        public static Result<T> BadRequest(string message = "") => new(false, default!, [Error.BadRequest(message)]);
        public static Result<T> Conflict(string message = "") => new(false, default!, [Error.Conflict(message)]);

        // Functional helpers
        public Result<K> Map<K>(Func<T, K> map)
            => IsSuccess ? Result<K>.Success(map(Value)) : Result<K>.Failure(Errors);

        public Result<K> Bind<K>(Func<T, Result<K>> next)
            => IsSuccess ? next(Value) : Result<K>.Failure(Errors);

        public Result<T> Ensure(Func<T, bool> predicate, Error error)
            => IsSuccess && !predicate(Value) ? Failure(error) : this;
    }
}
