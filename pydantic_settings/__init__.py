class SettingsConfigDict(dict):
    pass


class BaseSettings:
    def __init__(self, **kwargs):
        anns = getattr(self.__class__, '__annotations__', {})
        for name in anns:
            value = kwargs.get(name, getattr(self.__class__, name))
            setattr(self, name, value)
