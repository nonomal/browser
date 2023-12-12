use anyhow::{bail, Result};

use crate::biometrics::{KeyMaterial, OsDerivedKey};

/// The Unix implementation of the biometric trait.
pub struct Biometric {}

impl super::BiometricTrait for Biometric {
    fn prompt(_hwnd: Vec<u8>, _message: String) -> Result<bool> {
        bail!("platform not supported");
    }

    fn available() -> Result<bool> {
        bail!("platform not supported");
    }

    fn derive_key_material(_iv_str: Option<&str>) -> Result<OsDerivedKey> {
        bail!("platform not supported");
    }

    fn get_biometric_secret(
        _service: &str,
        _account: &str,
        _key_material: Option<KeyMaterial>,
    ) -> Result<String> {
        bail!("platform not supported");
    }

    fn set_biometric_secret(
        _service: &str,
        _account: &str,
        _secret: &str,
        _key_material: Option<KeyMaterial>,
        _iv_b64: &str,
    ) -> Result<String> {
        bail!("platform not supported");
    }
}
